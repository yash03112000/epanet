const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema({
	lat: {
		type: mongoose.Schema.Types.Decimal128,
	},
	lng: {
		type: mongoose.Schema.Types.Decimal128,
	},
});

const LayerSchema = new mongoose.Schema({
	name: {
		type: String,
		default: '',
	},
	source: [PointSchema],
	dest: [PointSchema],
});

const RouteSchema = new mongoose.Schema({
	name: {
		type: String,
		default: '',
	},
	layers: [LayerSchema],
});

const Route = mongoose.model('Route', RouteSchema);

module.exports = Route;
