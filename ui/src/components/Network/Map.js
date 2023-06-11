import { routeAtom, OptimiseAtom, optimisePathAtom } from '@/atoms/network';
import {
	GoogleMap,
	LoadScript,
	Polyline,
	Marker,
} from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { PolyUtil, SphericalUtil } from 'node-geometry-library';
import { turf } from '@turf/turf';

const containerStyle = {
	width: '100vw',
	height: '100vh',
};

const center = {
	lat: 28.745,
	lng: 80.523,
};

const colors = [
	'#003399',
	'#cc0000',
	'#006600',
	'#cc00ff',
	'#003366',
	'#990099',
];

export default function Map() {
	const [route, setRoute] = useRecoilState(routeAtom);
	const [paths, setPaths] = useState([]);
	const [markers, setMarkers] = useState([]);
	const [optimise, setOptimise] = useRecoilState(OptimiseAtom);
	const [optimisePath, setOptimisePath] = useRecoilState(optimisePathAtom);

	useEffect(() => {
		if (optimise && optimisePath.length == 0) {
			optimiseFun();
		}
	}, [optimise]);

	const getClosest = (arr, point) => {
		// console.log(arr[0]);
		console.log(point);
		var mi = Number.MAX_VALUE;
		var ans = -1;
		for (var p of arr) {
			var dis = SphericalUtil.computeDistanceBetween(p, point);
			if (dis < mi) {
				// console.log(dis);
				// console.log(p);
				mi = dis;
				ans = p;
			}
		}
		return ans;
	};

	const optimiseFun = () => {
		console.log('here');
		if (paths.length == 0) return;
		var temp = [];
		var mainArr = [];

		for (let layer of paths) {
			var temp = [];
			for (var i = 0; i < layer.length; i++) {
				var p = layer[i];
				var a = { lat: p.toJSON().lat, lng: p.toJSON().lng };
				var issue = -1;
				for (let j in mainArr) {
					if (PolyUtil.isLocationOnPath(a, mainArr[j], 3)) {
						issue = j;
					}
				}
				if (issue == -1) {
					// if temp is zero that means new path has started to form so that can be source or after overlap
					if (i > 0 && temp.length == 0) {
						var p2 = layer[i - 1];
						var a2 = { lat: p2.toJSON().lat, lng: p2.toJSON().lng };
						for (let j in mainArr) {
							if (PolyUtil.isLocationOnPath(a2, mainArr[j], 3)) {
								console.log('bleh');
								issue = j;
							}
						}
						console.log(issue);
						if (issue != -1) {
							let point = getClosest(mainArr[issue], a);
							// console.log(point);
							// console.log(a);
							temp.push(point);
						}
					}
					temp.push(a);
				} else {
					if (temp.length == 0) continue;
					// if temp is not zero, a path has just finished being drawn
					let point = getClosest(mainArr[issue], {
						lat: layer[i - 1].toJSON().lat,
						lng: layer[i - 1].toJSON().lng,
					});
					console.log(a);
					console.log(point);
					temp.push(point);
					console.log(issue);
					mainArr.push(temp);
					temp = [];
				}
			}
			if (temp.length > 0) mainArr.push(temp);
		}

		console.log(temp);
		console.log(mainArr);
		setOptimisePath(mainArr);
	};

	const initial = async () => {
		console.log(route);
		var directionsService = new google.maps.DirectionsService();
		let layerCords = [];
		let markers = [];
		await Promise.all(
			route.layers.map(async (layer) => {
				if (layer.source.length > 0)
					markers.push({
						lat: parseFloat(layer.source[0].lat.$numberDecimal),
						lng: parseFloat(layer.source[0].lng.$numberDecimal),
					});
				const e = await Promise.all(
					layer.dest.map(async (d) => {
						if (layer.source.length > 0 && layer.dest.length > 0) {
							markers.push({
								lat: parseFloat(d.lat.$numberDecimal),
								lng: parseFloat(d.lng.$numberDecimal),
							});
							var request = {
								origin: {
									lat: parseFloat(layer.source[0].lat.$numberDecimal),
									lng: parseFloat(layer.source[0].lng.$numberDecimal),
								},
								destination: {
									lat: parseFloat(d.lat.$numberDecimal),
									lng: parseFloat(d.lng.$numberDecimal),
								},
								travelMode: 'DRIVING',
							};
							try {
								const response = await directionsService.route(request);
								console.log(response);
								if (response.status == 'OK') {
									const pathI = response.routes[0].overview_path;
									console.log(pathI);
									layerCords.push(pathI);
									return {};
								}
							} catch (error) {
								console.log(error);
								return error;
							}
						}
					})
				);
				return e;
			})
		);
		console.log(layerCords);
		setPaths(layerCords);
		setMarkers(markers);
	};

	// console.log(paths);
	// console.log(markers);
	const options = {
		strokeColor: 'red',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		// fillColor: '#FF0000',
		fillOpacity: 0.35,
		clickable: false,
		draggable: false,
		editable: false,
		visible: true,
		radius: 30000,

		zIndex: 1,
	};

	return (
		<LoadScript googleMapsApiKey="AIzaSyA_OjhqUEZngOmypOPNnzBZyAvxUtAwhmE">
			<GoogleMap
				mapContainerStyle={containerStyle}
				center={center}
				zoom={8}
				options={{
					zoomControl: false,
					fullscreenControl: false,
					mapTypeControl: false,
					streetViewControl: false,
				}}
				onLoad={() => {
					initial();
				}}
			>
				{markers.map((des, i) => (
					<Marker
						position={des}
						key={i}
						// label={{ text: `D${i}`, color: 'white' }}
						// onClick={() => setInfoPos(des)}
					/>
				))}
				{!optimise &&
					paths.map((path, i) => {
						const options = {
							strokeColor: colors[i % colors.length],
							strokeOpacity: 0.8,
							strokeWeight: 2,
							// fillColor: '#FF0000',
							fillOpacity: 0.35,
							clickable: false,
							draggable: false,
							editable: false,
							visible: true,
							radius: 30000,

							zIndex: 1,
						};
						return <Polyline path={path} key={i} options={options} />;
					})}
				{optimise &&
					optimisePath.map((path, i) => {
						const options = {
							strokeColor: colors[i % colors.length],
							strokeOpacity: 0.8,
							strokeWeight: 2,
							// fillColor: '#FF0000',
							fillOpacity: 0.35,
							clickable: false,
							draggable: false,
							editable: false,
							visible: true,
							radius: 30000,

							zIndex: 1,
						};
						return <Polyline path={path} key={i} options={options} />;
					})}
			</GoogleMap>
		</LoadScript>
	);
}
