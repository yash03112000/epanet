import {
	routeAtom,
	OptimiseAtom,
	optimisePathAtom,
	junctionsAtom,
} from '@/atoms/network';
import {
	GoogleMap,
	LoadScript,
	Polyline,
	Marker,
} from '@react-google-maps/api';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { PolyUtil, SphericalUtil } from 'node-geometry-library';
// import lineOverlap from '@turf/line-overlap';
import { lineString, lineOverlap, distance, kinks, simplify } from '@turf/turf';
import axios from 'axios';
const containerStyle = {
	width: '100vw',
	height: '100vh',
};

const center = {
	lat: 26.761951263152167,
	lng: 80.5,
};

const colors = [
	'#e6194b',
	'#3cb44b',
	'#ffe119',
	'#4363d8',
	'#f58231',
	'#911eb4',
	'#46f0f0',
	'#f032e6',
	'#bcf60c',
	'#fabebe',
	'#008080',
	'#e6beff',
	'#9a6324',
	'#800000',
	'#aaffc3',
	'#808000',
	'#ffd8b1',
	'#000075',
	'#808080',
	'#000000',
];

export default function Mapcom() {
	const [route, setRoute] = useRecoilState(routeAtom);
	const [paths, setPaths] = useState([]);
	const [markers, setMarkers] = useState([]);
	const [optimise, setOptimise] = useRecoilState(OptimiseAtom);
	const [optimisePath, setOptimisePath] = useRecoilState(optimisePathAtom);
	const [junctions, setJunctions] = useRecoilState(junctionsAtom);

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

	// const optimiseFun = () => {
	// 	console.log('here');
	// 	if (paths.length == 0) return;
	// 	var temp = [];
	// 	var mainArr = [];
	// 	for (let layer of paths) {
	// 		var temp = [];
	// 		for (var i = 0; i < layer.length; i++) {
	// 			var p = layer[i];
	// 			var a = { lat: p.toJSON().lat, lng: p.toJSON().lng };
	// 			var issue = -1;
	// 			for (let j in mainArr) {
	// 				if (PolyUtil.isLocationOnPath(a, mainArr[j], 3)) {
	// 					issue = j;
	// 				}
	// 			}
	// 			if (issue == -1) {
	// 				// if temp is zero that means new path has started to form so that can be source or after overlap
	// 				if (i > 0 && temp.length == 0) {
	// 					var p2 = layer[i - 1];
	// 					var a2 = { lat: p2.toJSON().lat, lng: p2.toJSON().lng };
	// 					for (let j in mainArr) {
	// 						if (PolyUtil.isLocationOnPath(a2, mainArr[j], 3)) {
	// 							console.log('bleh');
	// 							issue = j;
	// 						}
	// 					}
	// 					console.log(issue);
	// 					if (issue != -1) {
	// 						let point = getClosest(mainArr[issue], a);
	// 						// console.log(point);
	// 						// console.log(a);
	// 						temp.push(point);
	// 					}
	// 				}
	// 				temp.push(a);
	// 			} else {
	// 				if (temp.length == 0) continue;
	// 				// if temp is not zero, a path has just finished being drawn
	// 				let point = getClosest(mainArr[issue], {
	// 					lat: layer[i - 1].toJSON().lat,
	// 					lng: layer[i - 1].toJSON().lng,
	// 				});
	// 				console.log(a);
	// 				console.log(point);
	// 				temp.push(point);
	// 				console.log(issue);
	// 				mainArr.push(temp);
	// 				temp = [];
	// 			}
	// 		}
	// 		if (temp.length > 0) mainArr.push(temp);
	// 	}

	// 	console.log(temp);
	// 	console.log(mainArr);
	// 	setOptimisePath(mainArr);
	// };

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
								// console.log(response);
								if (response.status == 'OK') {
									const pathI = response.routes[0].overview_path;
									var pathValues2 = [];
									for (var i = 0; i < pathI.length; i++) {
										pathValues2.push(pathI[i].toUrlValue());
									}
									// console.log(pathValues);
									const chunkSize = 100;
									var pathValues = [];
									// for (let i = 0; i < pathValues2.length; i += chunkSize) {
									// 	// i -= 10;
									// 	const chunk = pathValues2.slice(i, i + chunkSize);
									// 	pathValues.push(chunk);
									// }
									// console.log(response);
									var final = [];
									for (let step of response.routes[0].legs[0].steps) {
										final = final.concat(step.path);
									}
									// console.log(final);
									// await (async function loop() {
									// 	for (let i = 0; i < pathValues.length; i++) {
									// 		var pathValue = pathValues[i];
									// 		// console.log(i);
									// 		const res = await axios.get(
									// 			'https://roads.googleapis.com/v1/snapToRoads?interpolate=true&path=' +
									// 				pathValue.join('|') +
									// 				'&key=AIzaSyA_OjhqUEZngOmypOPNnzBZyAvxUtAwhmE'
									// 		);
									// 		// console.log(i);
									// 		var path2 = [];
									// 		// console.log(res.data.snappedPoints.at(-1));
									// 		for (let p of res.data.snappedPoints) {
									// 			// if (p.originalIndex < 10) continue;
									// 			path2.push({
									// 				lng: p.location.longitude,
									// 				lat: p.location.latitude,
									// 			});
									// 		}
									// 		final = final.concat(path2);
									// 	}
									// })();
									// console.log('final');
									// console.log(final);

									layerCords.push({
										path: final,
										source: request.origin,
										dest: request.destination,
									});
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
		// console.log(layerCords);
		setPaths(layerCords);
		setMarkers(markers);
	};

	const optimiseFun = () => {
		var set = new Set();
		for (var i = 0; i < paths.length; i++) {
			for (var j = 0; j < paths.length; j++) {
				if (i == j) continue;
				var cors1 = [];
				var cors2 = [];
				for (var p of paths[i].path) {
					var a = [p.toJSON().lng, p.toJSON().lat];
					// var a = [p.lng, p.lat];
					if (cors1.length > 0) {
						if (a[0] == cors1.at(-1)[0] && a[1] == cors1.at(-1)[1]) continue;
					}
					cors1.push(a);
				}
				// if (j == 0) {
				// 	console.log(cors1);
				// }
				for (var p of paths[j].path) {
					var a = [p.toJSON().lng, p.toJSON().lat];
					// var a = [p.lng, p.lat];
					if (cors2.length > 0) {
						if (a[0] == cors2.at(-1)[0] && a[1] == cors2.at(-1)[1]) continue;
					}
					cors2.push(a);
				}
				var l1 = lineString(cors1);
				var l2 = lineString(cors2);
				// console.log(l1);
				// console.log(l1);
				var overlap = lineOverlap(l1, l2, { tolerance: 0.0 });
				// console.log(overlap);
				// console.log(kinks(lineString(cors1)).features.length);
				if (overlap.features.length == 0) continue;
				// console.log(
				// 	cors1.length,
				// 	'-',
				// 	cors2.length,
				// 	'-',
				// 	overlap.features[0].geometry.coordinates.length,
				// 	'-',
				// 	overlap.features.length,
				// 	'-',
				// 	kinks(lineString(cors1)).features.length
				// );
				for (let k = 0; k < overlap.features.length; k++) {
					var slice = overlap.features[k].geometry.coordinates;
					var jn1 = { lat: slice[0][1], lng: slice[0][0] };
					var jn2 = {
						lat: slice[slice.length - 1][1],
						lng: slice[slice.length - 1][0],
					};
					var issue1 = false;
					var issue2 = false;
					// for (var point of markers) {
					// 	var dis = distance([point.lng, point.lat], [jn1.lng, jn1.lat]);
					// 	if (dis < 0.003) issue1 = true;
					// }
					// for (var point of markers) {
					// 	var dis = distance([point.lng, point.lat], [jn2.lng, jn2.lat]);
					// 	if (dis < 0.003) issue2 = true;
					// }
					if (!issue1) set.add(JSON.stringify(jn1));
					if (!issue2) set.add(JSON.stringify(jn2));
				}
			}
		}
		// console.log(paths);
		for (let path of paths) {
			var start = path.path[0];
			start = start.toJSON();
			var source = path.source;
			var dest = path.dest;
			var end = path.path.at(-1);
			end = end.toJSON();
			// var dis = distance([start.lng, source.lng], [start.lat, source.lat]);
			// if (dis > 0.003)
			set.add(JSON.stringify(start));
			// dis = distance([end.lng, dest.lng], [end.lat, dest.lat]);
			// if (dis > 0.003)
			set.add(JSON.stringify(end));
		}
		console.log(set);

		var jns = [];
		var jnIndex = 0;
		var srcIndex = 0;
		var destIndex = 0;
		for (let i of set) {
			let obj = {};
			obj.cords = JSON.parse(i);
			obj.id = `Junction-${jnIndex}`;
			jns.push(obj);
			jnIndex += 1;
		}
		for (let layer of route.layers) {
			for (let i of layer.source) {
				let obj = {};
				obj.cords = {
					lng: parseFloat(i.lng.$numberDecimal),
					lat: parseFloat(i.lat.$numberDecimal),
				};
				if (set.has(JSON.stringify(obj.cords))) continue;
				obj.id = `Source-${srcIndex}`;
				jns.push(obj);
				srcIndex += 1;
				set.add(JSON.stringify(obj.cords));
			}
			for (let i of layer.dest) {
				let obj = {};
				obj.cords = {
					lng: parseFloat(i.lng.$numberDecimal),
					lat: parseFloat(i.lat.$numberDecimal),
				};
				if (set.has(JSON.stringify(obj.cords))) continue;
				obj.id = `Destination-${destIndex}`;
				jns.push(obj);
				destIndex += 1;
				set.add(JSON.stringify(obj.cords));
			}
		}
		setJunctions(jns);

		// // console.log(set);

		var mainArr = [];
		var set2 = new Set();
		console.log('junctions', jns);
		// console.log(paths);

		for (var path of paths) {
			var start = path.path[0];
			start = start.toJSON();
			var end = path.path.at(-1);
			end = end.toJSON();
			var temp = [];
			// console.log(path);
			// temp.push(path.source);
			var sourceId = {};
			var destId = {};
			for (let p of jns) {
				if (p.cords.lng === start.lng && p.cords.lat === start.lat) {
					sourceId = p;
				}
			}
			console.log(start);
			for (let p of jns) {
				if (p.cords.lat === end.lat && p.cords.lng === p.cords.lng) {
					destId = p;
				}
			}
			console.log(sourceId.id, '-', destId.id);
			for (let point of path.path) {
				if (temp.length === 0 && mainArr.length != 0) {
					temp.push(sourceId.cords);
				}
				var jnId = {};
				for (let p of jns) {
					if (
						p.cords.lng === point.toJSON().lng &&
						p.cords.lat === point.toJSON().lat
					) {
						jnId = p;
					}
				}
				temp.push(point.toJSON());
				if (typeof jnId.id !== 'undefined') {
					if (sourceId.id === jnId.id) continue;
					var id1 = sourceId.id + '-' + jnId.id;
					var id2 = jnId.id + '-' + sourceId.id;
					if (!(set2.has(id1) || set2.has(id2))) {
						console.log('srcid', sourceId);
						// console.log('jnid', jnId);
						mainArr.push(temp);
						set2.add(id1);
						set2.add(id2);
					}
					temp = [];
					sourceId = jnId;
				}
			}
		}

		for (let path of paths) {
			var start = path.path[0];
			start = start.toJSON();
			var source = path.source;
			var dest = path.dest;
			var end = path.path.at(-1);
			end = end.toJSON();
			var temp = [source, start];
			mainArr.push(temp);
			temp = [end, dest];
			mainArr.push(temp);
		}
		console.log(set2);
		console.log(mainArr);
		setOptimisePath(mainArr);
	};

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
				{!optimise &&
					markers.map((des, i) => (
						<Marker
							position={des}
							key={i}
							// label={{ text: `D${i}`, color: 'white' }}
							// onClick={() => setInfoPos(des)}
						/>
					))}
				{optimise &&
					junctions.map((des, i) => (
						<Marker
							position={des.cords}
							key={i}
							label={{ text: des.id, color: 'black' }}
							onClick={() => setInfoPos(des)}
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
						return <Polyline path={path.path} key={i} options={options} />;
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
