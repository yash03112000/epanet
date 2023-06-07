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

server.get('/', (req, res) => {
	res.json({});
});

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

	model.init('', '', 0, 0);

	geojson.features.forEach((feature) => {
		const { type, coordinates } = feature.geometry;
		const prop = feature.properties;
		if (type === 'Point') {
			const id = prop.id;
			console.log(id);
			const index = model.addNode(id, 0);
			model.setCoordinates(index, coordinates[1], coordinates[0]);
		} else if (type === 'LineString') {
			const id = prop.id;
			console.log(id);
			const index = model.addLink(id, 1, prop.from, prop.to);
			x = [];
			y = [];
			coordinates.forEach((cord) => {
				x.push(cord[1]);
				y.push(cord[0]);
			});
			model.setVertices(index, x, y);
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
