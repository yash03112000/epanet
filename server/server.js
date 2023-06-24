const express = require('express');
const server = express();
const port = process.env.PORT || 5000;
const mongoose = require('mongoose');
const morgan = require('morgan');
const isDev = process.env.NODE_ENV !== 'production';
var cors = require('cors');
const Route = require('./models/Route');
const kml = require('gtran-kml');
const { Project, Workspace, Pipe } = require('epanet-js');
var fs = require('fs');
var shpwrite = require('shp-write');
const Drawing = require('dxf-writer');
const utm = require('utm');

const connectDB = async () => {
	try {
		const conn = await mongoose.connect('mongodb://localhost:27017/epanet', {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			// useFindAndModify: false,
			// useCreateIndex: true,
		});

		mongoose.Promise = global.Promise;

		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};
connectDB();
server.use(cors());

if (isDev) {
	// console.log(process.env.NODE_ENV);
	server.use(
		morgan('dev', {
			skip: function (req, res) {
				if (req.url.split('/static/')[0] == '/_next') {
					return true;
				} else {
					return false;
				}
			},
		})
	);
}
server.use(express.urlencoded({ extended: true, limit: '10mb' }));
server.use(express.json({ limit: '10mb' }));

server.post('/saveRoute', async (req, res) => {
	console.log(req.body);
	const { body, mode, layers } = req.body;
	console.log(body.id);
	if (mode === 1 || body.id == '') {
		console.log('here');
		var route = new Route();
		route.name = body.name;
		route.layers = layers;
		const res2 = await route.save();
		res.json(res2);
	} else if (mode == 0) {
		const route = await Route.findById(body.id);
		route.name = body.name;
		route.layers = layers;
		const res2 = await route.save();
		res.json(res2);
	}
});

const latLngToUtm = (latitude, longitude) => {
	// Convert latitude and longitude to UTM coordinates
	const utmCoords = utm.fromLatLon(latitude, longitude);
	console.log(utmCoords);

	// Return UTM easting and northing values
	return {
		easting: utmCoords.easting,
		northing: utmCoords.northing,
		zoneNumber: utmCoords.zoneNum,
		zoneLetter: utmCoords.zoneLetter,
	};
};

server.post('/tokml', async (req, res) => {
	// console.log(req.body.json);
	const file = await kml.fromGeoJson(req.body.json);
	res.json({ data: file.data });
});

server.post('/toepanet', (req, res) => {
	const geojson = req.body.json;
	const ws = new Workspace();
	const model = new Project(ws);
	// const net1 = fs.readFileSync('a.inp');
	// ws.writeFile('a.inp', net1);

	model.init('', '', 6, 0);

	geojson.features.forEach((feature) => {
		const { type, coordinates } = feature.geometry;
		const prop = feature.properties;
		if (type === 'Point') {
			const id = prop.id;
			console.log(id);
			if (id.split('-')[0] === 'Source') {
				const index = model.addNode(id, 1);
				model.setCoordinates(
					index,
					latLngToUtm(coordinates[1], coordinates[0]).easting,
					latLngToUtm(coordinates[1], coordinates[0]).northing
				);
			} else {
				const index = model.addNode(id, 0);
				model.setCoordinates(
					index,
					latLngToUtm(coordinates[1], coordinates[0]).easting,
					latLngToUtm(coordinates[1], coordinates[0]).northing
				);
			}
		} else if (type === 'LineString') {
			const id = prop.id;
			console.log(id);
			const index = model.addLink(id, 1, prop.from, prop.to);
			x = [];
			y = [];
			coordinates.forEach((cord) => {
				x.push(latLngToUtm(cord[1], cord[0]).easting);
				y.push(latLngToUtm(cord[1], cord[0]).northing);
			});
			model.setVertices(index, x, y);
			// console.log(prop.distance);
			if (prop.distance == 0) prop.distance = 1;
			model.setPipeData(index, prop.distance, 10, 130, 0);
		}
	});
	console.log(model.getCount(0));

	model.saveInpFile(`a.inp`);
	const file = ws.readFile('a.inp');
	fs.writeFileSync('a.inp', file);
	console.log(file);
	model.close();
	res.json({ data: file });
});

server.post('/toshp', async (req, res) => {
	const geojson = req.body.json;
	console.log('here');
	const file = await shpwrite.zip(geojson);
	console.log(file);
	res.writeHead(200, {
		'Content-Disposition': `attachment; filename="a.zip"`,
		'Content-Type': 'application/zip',
	});
	return res.end(file);
});

server.post('/todxf', (req, res) => {
	const dxfObj = new Drawing();
	const geojson = req.body.json;
	geojson.features.forEach((feature) => {
		const geometry = feature.geometry;
		const properties = feature.properties;

		if (geometry.type === 'Point') {
			const [y, x] = geometry.coordinates;
			dxfObj.drawPoint(latLngToUtm(x, y).easting, latLngToUtm(x, y).northing);
		} else if (geometry.type === 'LineString') {
			const points = geometry.coordinates.map((coord) => [
				latLngToUtm(coord[1], coord[0]).easting,
				latLngToUtm(coord[1], coord[0]).northing,
			]);
			dxfObj.drawPolyline(points);
		}
	});
	const dxfOutput = dxfObj.toDxfString();
	res.json({
		data: dxfOutput,
	});
});

server.get('/myRoutes', async (req, res) => {
	const routes = await Route.find();
	res.json({
		routes: routes,
	});
});

server.get('/getRoute/:id', async (req, res) => {
	const route = await Route.findById(req.params.id);
	res.json({
		route: route,
	});
});

server.listen(port, (err) => {
	if (err) throw err;
	console.log(`> Ready on http://localhost:${port}`);
});
