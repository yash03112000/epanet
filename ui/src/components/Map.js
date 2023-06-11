import {
	GoogleMap,
	LoadScript,
	DirectionsService,
	DirectionsRenderer,
	Polyline,
	TrafficLayer,
	TransitLayer,
	BicyclingLayer,
	KmlLayer,
	Marker,
	useGoogleMap,
} from '@react-google-maps/api';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
	sourceAtom,
	destAtom,
	newRouteAtom,
	runAtom,
	mapAtom,
	mapLoadAtom,
	measureAtom,
	mapTypeAtom,
	mapStyleAtom,
	measureDestAtom,
	measureSourceAtom,
} from '../atoms/index';
import AddIcon from '@mui/icons-material/Add';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';
import HomeIcon from '@mui/icons-material/Home';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import Elevation from './Elevation';

const containerStyle = {
	width: '100vw',
	height: '100vh',
};

const center = {
	lat: 28.745,
	lng: 80.523,
};
const lib = ['places'];

export default function Map() {
	const [source, setSource] = useRecoilState(sourceAtom);
	const [dest, setDest] = useRecoilState(destAtom);
	const [newRoute, setnewRoute] = useRecoilState(newRouteAtom);
	const [run, setRun] = useRecoilState(runAtom);
	const [map, setMap] = useRecoilState(mapAtom);
	const [mapLoad, setMapLoad] = useRecoilState(mapLoadAtom);
	const [measure, setMeasure] = useRecoilState(measureAtom);
	const [mapType, setMapType] = useRecoilState(mapTypeAtom);
	const [mapStyle, setMapStyle] = useRecoilState(mapStyleAtom);
	const [measureSource, setMeasureSource] = useRecoilState(measureSourceAtom);
	const [measureDest, setMeasureDest] = useRecoilState(measureDestAtom);

	const mapRef = useRef();
	const [infoPos, setInfoPos] = useState(null);

	const mapClickFun = (latlog) => {
		if (newRoute) {
			// setRun(false);
			if (source.length == 0) {
				setSource((old) => [...old, latlog]);
			} else {
				setDest((old) => [...old, latlog]);
			}
		} else if (measure) {
			// setRun(false);
			if (measureSource.length == 0) {
				setMeasureSource((old) => [...old, latlog]);
			} else {
				setMeasureDest((old) => [...old, latlog]);
			}
		}
	};

	const getBookmark = () => {
		return {
			center: mapRef.current.getCenter().toJSON(),
			zoom: mapRef.current.getZoom(),
		};
	};

	const setBookmark = (prop) => {
		console.log(prop);
		mapRef.current.setCenter({
			lng: prop.center.lng,
			lat: prop.center.lat,
		});
		mapRef.current.setZoom(prop.zoom);
	};

	const BaseMapFun = () => {
		// console.log(mapType);
		if (mapRef.current) mapRef.current.setOptions({ styles: [] });
		if (mapType === 'Traffic') {
			return <TrafficLayer />;
		} else if (mapType === 'Transit') {
			return <TransitLayer />;
		} else if (mapType === 'Biking') {
			return <BicyclingLayer />;
		} else if (mapType === 'Terrain') {
			return (
				<KmlLayer url="http://googlemaps.github.io/js-v2-samples/ggeoxml/cta.kml" />
			);
		} else if (mapType === 'More') {
			mapRef.current.setOptions({ styles: mapStyle });
		}
	};

	const addZoom = () => {
		var zoom = mapRef.current.getZoom();
		mapRef.current.setZoom(zoom + 1);
	};

	const subtractZoom = () => {
		var zoom = mapRef.current.getZoom();
		mapRef.current.setZoom(zoom - 1);
	};

	function success(pos) {
		var crd = pos.coords;

		// console.log('Your current position is:');
		// console.log(`Latitude : ${crd.latitude}`);
		// console.log(`Longitude: ${crd.longitude}`);
		// console.log(`More or less ${crd.accuracy} meters.`);
		setBookmark({
			center: { lat: crd.latitude, lng: crd.longitude },
			zoom: 12,
		});
	}
	const gps = () => {
		if (navigator.geolocation) {
			navigator.permissions
				.query({ name: 'geolocation' })
				.then(function (result) {
					if (result.state === 'granted') {
						console.log(result.state);
						//If granted then you can directly call your function here
						navigator.geolocation.getCurrentPosition(success);
					} else if (result.state === 'prompt') {
					} else if (result.state === 'denied') {
						alert('Give Permission');
					}
					// result.onchange = function () {
					// 	console.log(result.state);
					// };
				});
		} else {
			alert('Sorry Not available!');
		}
	};

	const home = () => {
		if (source.length > 0 && dest.length == 0) {
			mapRef.current.setCenter({ lng: source[0].lng, lat: source[0].lat });
		} else if (source.length > 0 && dest.length > 0) {
			var minLat = source[0].lat;
			var maxLat = source[0].lat;
			var minLng = source[0].lng;
			var maxLng = source[0].lng;
			for (var i = 0; i < dest.length; i++) {
				if (dest[i].lat < minLat) minLat = dest[i].lat;
				if (dest[i].lat > maxLat) maxLat = dest[i].lat;
				if (dest[i].lng < minLng) minLng = dest[i].lng;
				if (dest[i].lng > maxLng) maxLng = dest[i].lng;
			}
			console.log(maxLat);
			console.log(minLat);
			console.log(maxLng);
			console.log(minLng);

			mapRef.current.fitBounds({
				north: maxLat,
				south: minLat,
				east: maxLng,
				west: minLng,
			});
		}
	};

	return (
		<LoadScript
			googleMapsApiKey="AIzaSyA_OjhqUEZngOmypOPNnzBZyAvxUtAwhmE"
			libraries={lib}
		>
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
				onClick={(e) => {
					mapClickFun(e.latLng.toJSON());
					// console.log(mapRef.current.getZoom());
					// mapRef.current.data.toGeoJson(function (data) {
					// 	console.log(data);
					// });
				}}
				onLoad={(m) => {
					mapRef.current = m;
					// m.data.loadGeoJson('g2.json');
					setMap({ getBookmark: getBookmark, setBookmark: setBookmark });
					setMapLoad(true);
				}}
				onUnmount={() => setMapLoad(false)}
			>
				{run &&
					dest.map((d, i) => <Direction src={source[0]} des={d} key={i} />)}
				{measure && measureSource.length && measureDest.length && (
					<MapMeasure src={measureSource[0]} des={measureDest} />
				)}
				{BaseMapFun()}
				<div className="z-10 bg-slate-200  relative flex flex-col w-10 h-50 items-center justify-center cursor-pointer p-3">
					<AddIcon onClick={addZoom} className="m-1" />
					<HorizontalRuleIcon onClick={subtractZoom} className="m-1" />
					<HomeIcon onClick={home} className="m-1" />
					<GpsFixedIcon onClick={gps} className="m-1" />
				</div>

				{source.map((src, i) => (
					<Marker
						position={src}
						label={{ text: 'S', color: 'white' }}
						onClick={() => setInfoPos(src)}
						key={i}
					/>
				))}
				{dest.map((des, i) => (
					<Marker
						position={des}
						key={i}
						label={{ text: `D${i}`, color: 'white' }}
						onClick={() => setInfoPos(des)}
					/>
				))}
				{infoPos && <Elevation pos={infoPos} setInfoPos={setInfoPos} />}
			</GoogleMap>
		</LoadScript>
	);
}

const MapMeasure = ({ src, des }) => {
	const [path, setPath] = useState([src]);
	useMemo(() => {
		setPath((old) => [...old, des[des.length - 1]]);
	}, [des]);
	console.log(path);

	const options = {
		strokeColor: '#FF0000',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: '#FF0000',
		fillOpacity: 0.35,
		clickable: false,
		draggable: false,
		editable: false,
		visible: true,
		radius: 30000,
		paths: [
			{ lat: 37.772, lng: -122.214 },
			{ lat: 21.291, lng: -157.821 },
			{ lat: -18.142, lng: 178.431 },
			{ lat: -27.467, lng: 153.027 },
		],
		zIndex: 1,
	};
	return <Polyline path={path} options={options} />;
};

const Direction = ({ src, des }) => {
	const [res, setRes] = useState(null);
	const map = useGoogleMap();
	useEffect(() => {
		directionsCallback();
	}, [src, des]);

	const lineSymbol = {
		path: 'M 0,-1 0,1',
		strokeOpacity: 1,
		scale: 4,
	};

	const options = {
		strokeOpacity: 0,
		strokeColor: '#7d7d7d',
		icons: [
			{
				icon: lineSymbol,
				offset: '0',
				repeat: '20px',
			},
		],
	};

	const directionsCallback = async () => {
		var directionsService = new google.maps.DirectionsService();

		// console.log(src);
		// console.log(des);
		var request = {
			origin: src,
			destination: des,
			travelMode: 'DRIVING',
		};
		const response = await directionsService.route(request);
		setRes(response);
	};

	console.log(res);

	return (
		<>
			{res !== null && (
				<>
					<DirectionsRenderer
						// required
						options={{
							// eslint-disable-line react-perf/jsx-no-new-object-as-prop
							directions: res,
							preserveViewport: true,
							suppressMarkers: true,
							hideRouteList: true,
						}}
						// optional
						onLoad={(directionsRenderer) => {
							console.log(
								'DirectionsRenderer onLoad directionsRenderer: ',
								directionsRenderer
							);
						}}
						// optional
						onUnmount={(directionsRenderer) => {
							console.log(
								'DirectionsRenderer onUnmount directionsRenderer: ',
								directionsRenderer
							);
						}}
					/>
					<Polyline
						path={[
							res.routes[0].legs[0].steps[
								res.routes[0].legs[0].steps.length - 1
							].end_location,
							des,
						]}
						options={options}
					/>
				</>
			)}
		</>
	);
};
