import { useRecoilState, useRecoilValue } from 'recoil';
import {
	downloadModalAtom,
	optimisePathAtom,
	routeAtom,
	junctionsAtom,
} from '@/atoms/network';
import axios from 'axios';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { downloadZip } from 'client-zip';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};
export default function Download() {
	const [downloadModal, setDownloadModal] = useRecoilState(downloadModalAtom);
	const [optimisePath, setOptimisePath] = useRecoilState(optimisePathAtom);
	const route = useRecoilValue(routeAtom);
	const [junctions, setJunctions] = useRecoilState(junctionsAtom);

	const saveFile = async (blob, name) => {
		const a = document.createElement('a');
		a.download = name;
		a.href = URL.createObjectURL(blob);
		a.addEventListener('click', (e) => {
			setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
		});
		a.click();
	};

	const getGeoJSON = () => {
		var a = {};
		a.type = 'FeatureCollection';
		a.features = [];
		console.log(optimisePath);

		var index = 0;
		var jnIndex = 0;
		var points = new Map();
		for (let jn of junctions) {
			var d = {};
			d.type = 'Feature';
			var e = {};
			e.type = 'Point';
			e.coordinates = [jn.cords.lng, jn.cords.lat];
			d.geometry = e;
			d.properties = {};
			d.properties.id = jn.id;
			a.features.push(d);
			jnIndex += 1;
			points.set(JSON.stringify(e.coordinates), jn.id);
		}
		for (let path of optimisePath) {
			// console.log(path);
			var b = {};
			b.type = 'Feature';
			var c = {};
			c.type = 'LineString';
			c.coordinates = [];
			for (let p of path) {
				c.coordinates.push([p.lng, p.lat]);
			}
			b.geometry = c;
			var start = JSON.stringify(c.coordinates[0]);
			var end = JSON.stringify(c.coordinates.at(-1));
			b.properties = {};
			b.properties.id = `Pipe-${index}`;
			b.properties.from = points.get(start);
			b.properties.to = points.get(end);
			a.features.push(b);
			index += 1;
		}
		return a;
	};

	const getDistance = async () => {
		var dis = [];
		var sources = [];
		var destinations = [];

		await (async function loop() {
			console.log(optimisePath.length);
			for (let i = 0; i < optimisePath.length; i++) {
				const path = optimisePath[i];
				var start = path[0];
				var end = path.at(-1);
				sources.push(start);
				destinations.push(end);
				if (sources.length == 10 || i == optimisePath.length - 1) {
					console.log(sources.length, i);
					// console.log(sources);
					// console.log(destinations);
					var service = new google.maps.DistanceMatrixService();
					await service.getDistanceMatrix(
						{
							origins: sources,
							destinations: destinations,
							travelMode: 'DRIVING',
						},
						callback
					);

					function callback(res, status) {
						console.log(res);
						console.log(status);
						if (status == 'OK') {
							for (let j = 0; j < sources.length; j++)
								if (
									typeof res.rows[j].elements[j].distance.value !== 'undefined'
								)
									dis.push(res.rows[j].elements[j].distance.value);
								else dis.push(0);
						}
					}
					sources = [];
					destinations = [];
				}
			}
		})();
		return dis;
	};

	const prepareEpanet = (json, dis) => {
		let index = 0;
		for (let i = 0; i < json.features.length; i++) {
			if (json.features[i].geometry.type === 'LineString') {
				json.features[i].properties.distance = dis[index];
				index++;
			}
		}
	};

	const apply = async (type) => {
		console.log(type);
		if (optimisePath.length == 0) {
			alert('Kindly optimise path first');
		} else {
			var geoJson = getGeoJSON();
			console.log(geoJson);
			let contentType = 'application/json;charset=utf-8;';
			if (type === 'geojson') {
				var blob = new Blob(
					[decodeURIComponent(encodeURI(JSON.stringify(geoJson)))],
					{
						type: contentType,
					}
				);
				saveFile(blob, 'g2.json');
			} else if (type === 'kml') {
				const res = await axios.post('http://localhost:5000/tokml', {
					json: geoJson,
				});
				console.log(res.data.data);
				var blob = new Blob([res.data.data], { type: 'text/plain' });
				saveFile(blob, 'g2.kml');
			} else if (type === 'epanet') {
				const distances = await getDistance();
				console.log(distances);
				prepareEpanet(geoJson, distances);
				const res = await axios.post('http://localhost:5000/toepanet', {
					json: geoJson,
				});
				var blob = new Blob([res.data.data], { type: 'text/plain' });
				saveFile(blob, 'g2.inp');
			} else if (type === 'shp') {
				const axiosOptions = {
					responseType: 'arraybuffer',
					headers: {
						'Content-Type': 'application/json',
					},
				};
				const res = await axios.post(
					'http://localhost:5000/toshp',
					{
						json: geoJson,
					},
					axiosOptions
				);
				console.log(res);
				var blob = new Blob([res.data], { type: 'application/octet-stream' });
				saveFile(blob, 'g2.zip');
			} else if (type === 'dxf') {
				const res = await axios.post('http://localhost:5000/todxf', {
					json: geoJson,
				});
				// console.log(res.data.data);
				var blob = new Blob([res.data.data], { type: 'text/plain' });
				saveFile(blob, 'g2.dxf');
			}
		}

		setDownloadModal(false);
	};

	return (
		<Modal open={downloadModal} onClose={() => setDownloadModal(false)}>
			<Box sx={style}>
				<div className="flex flex-col my-5">
					<Button variant="outlined" onClick={() => apply('geojson')}>
						GeoJson
					</Button>
					<Button variant="outlined" onClick={() => apply('kml')}>
						KML
					</Button>
					<Button variant="outlined" onClick={() => apply('epanet')}>
						Epanet
					</Button>
					<Button variant="outlined" onClick={() => apply('shp')}>
						SHP
					</Button>
					<Button variant="outlined" onClick={() => apply('dxf')}>
						DXF
					</Button>
				</div>
			</Box>
		</Modal>
	);
}
