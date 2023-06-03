import { useRecoilState, useRecoilValue } from 'recoil';
import {
	downloadMenuAtom,
	mapAtom,
	sourceAtom,
	destAtom,
} from '../atoms/index';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState, useMemo } from 'react';
import tokml from 'tokml';
import axios from 'axios';

export default function Download() {
	const [anchorEl, setAnchorEl] = useRecoilState(downloadMenuAtom);
	const [map, setMap] = useRecoilState(mapAtom);
	const source = useRecoilValue(sourceAtom);
	const dest = useRecoilValue(destAtom);

	const handleClose = (i) => {
		setAnchorEl(null);
	};

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
		if (source.length > 0 && dest.length > 0) {
			var a = {};
			a.type = 'FeatureCollection';
			a.features = await Promise.all(
				dest.map(async (d) => {
					var request = {
						origin: source[0],
						destination: d,
						travelMode: 'DRIVING',
					};
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
				})
			);
			let contentType = 'application/json;charset=utf-8;';
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
				a.features.push(b);
			}
			// console.log(a);
			if (type === 'geojson') {
				var blob = new Blob(
					[decodeURIComponent(encodeURI(JSON.stringify(a)))],
					{
						type: contentType,
					}
				);
				saveFile(blob, 'g2.json');
			} else {
				const res = await axios.post('http://localhost:5000/tokml', {
					json: a,
				});
				console.log(res.data.data);
				var blob = new Blob([res.data.data], { type: 'text/plain' });
				saveFile(blob, 'g2.kml');
			}
		}
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	return (
		<Menu
			id="demo-positioned-menu"
			aria-labelledby="demo-positioned-button"
			anchorEl={anchorEl}
			open={open}
			onClose={handleClose}
			anchorOrigin={{
				vertical: 'top',
				horizontal: 'left',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'left',
			}}
		>
			<MenuItem onClick={() => apply('geojson')}>GeoJson</MenuItem>
			<MenuItem onClick={() => apply('kml')}>KML</MenuItem>
		</Menu>
	);
}
