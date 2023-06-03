const express = require('express');
const server = express();
const port = process.env.PORT || 5000;
const mongoose = require('mongoose');
const morgan = require('morgan');
const isDev = process.env.NODE_ENV !== 'production';
var cors = require('cors');
const Route = require('./models/Route');
const kml = require('gtran-kml');

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

server.listen(port, (err) => {
	if (err) throw err;
	console.log(`> Ready on http://localhost:${port}`);
});
