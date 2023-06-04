import { useRecoilState, useRecoilValue } from 'recoil';
import { downloadModalAtom, mapAtom, layerListAtom } from '../atoms/index';
import axios from 'axios';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import { useState } from 'react';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
	PaperProps: {
		style: {
			maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
			width: 250,
		},
	},
};

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
	const layerList = useRecoilValue(layerListAtom);
	const [layers, setLayers] = useState([]);

	const saveFile = async (blob, name) => {
		const a = document.createElement('a');
		a.download = name;
		a.href = URL.createObjectURL(blob);
		a.addEventListener('click', (e) => {
			setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
		});
		a.click();
	};
	const apply = async (type) => {
		var directionsService = new google.maps.DirectionsService();
		var a = {};
		a.type = 'FeatureCollection';
		a.features = [];
		await Promise.all(
			layerList.map(async (layer) => {
				var source = layer.source;
				var dest = layer.dest;
				if (
					layers.indexOf(layer.name) > -1 &&
					source.length > 0 &&
					dest.length > 0
				) {
					let temp = await Promise.all(
						dest.map(async (d) => {
							var request = {
								origin: source[0],
								destination: d,
								travelMode: 'DRIVING',
							};
							try {
								const response = await directionsService.route(request);
								console.log(response);
								if (response.status == 'OK') {
									const path = response.routes[0].overview_path;
									console.log(path);
									var b = {};
									b.type = 'Feature';
									var c = {};
									c.type = 'LineString';
									c.coordinates = [];
									console.log(path[0].toJSON());
									for (let p of path) {
										// console.log(p);
										// console.log(p.toJSON());
										c.coordinates.push([p.toJSON().lng, p.toJSON().lat]);
									}
									b.geometry = c;
									b.properties = {};
									b.properties.id = 1;

									// a.features.push(b);
									console.log(b);
									return b;
								}
							} catch (error) {
								console.log(error);
							}
						})
					);
					// a.features.push(temp);
					for (let item of [...source, ...dest]) {
						var b = {};
						b.type = 'Feature';
						var c = {};
						c.type = 'Point';
						c.coordinates = [];
						c.coordinates.push(item.lng);
						c.coordinates.push(item.lat);
						b.geometry = c;
						b.properties = {};
						b.properties.id = 1;
						temp.push(b);
					}
					console.log(temp);
					a.features = a.features.concat(temp);
					return temp;
				}
			})
		);
		console.log(a);
		let contentType = 'application/json;charset=utf-8;';
		if (type === 'geojson') {
			var blob = new Blob([decodeURIComponent(encodeURI(JSON.stringify(a)))], {
				type: contentType,
			});
			saveFile(blob, 'g2.json');
		} else {
			const res = await axios.post('http://localhost:5000/tokml', {
				json: a,
			});
			console.log(res.data.data);
			var blob = new Blob([res.data.data], { type: 'text/plain' });
			saveFile(blob, 'g2.kml');
		}
		setDownloadModal(false);
	};

	const handleChange = (event) => {
		const {
			target: { value },
		} = event;
		setLayers(
			// On autofill we get a stringified value.
			typeof value === 'string' ? value.split(',') : value
		);
	};

	return (
		<Modal open={downloadModal} onClose={() => setDownloadModal(false)}>
			<Box sx={style}>
				<div className="flex flex-row items-center justify-center">
					<FormControl sx={{ m: 1, width: 300 }}>
						<InputLabel id="demo-multiple-checkbox-label">Layer</InputLabel>
						<Select
							multiple
							value={layers}
							onChange={handleChange}
							input={<OutlinedInput label="Layers" />}
							renderValue={(selected) => selected.join(', ')}
							MenuProps={MenuProps}
						>
							{layerList.map((layer) => (
								<MenuItem value={layer.name} key={layer.name}>
									<Checkbox checked={layers.indexOf(layer.name) > -1} />
									<ListItemText primary={layer.name} />
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>
				<div className="flex flex-row my-5">
					<Button variant="outlined" onClick={() => apply('geojson')}>
						GeoJson
					</Button>
					<Button variant="outlined" onClick={() => apply('kml')}>
						KML
					</Button>
				</div>
			</Box>
		</Modal>
	);
}
