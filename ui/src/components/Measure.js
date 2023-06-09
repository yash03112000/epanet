import { useRecoilState, useRecoilValue } from 'recoil';
import {
	measureSourceAtom,
	measureDestAtom,
	measureAtom,
} from '../atoms/index';

export default function Measure() {
	const [source, setSource] = useRecoilState(measureSourceAtom);
	const [dest, setDest] = useRecoilState(measureDestAtom);

	const measure = useRecoilValue(measureAtom);

	const rad = (x) => {
		return (x * Math.PI) / 180;
	};

	const getDistance = (p1, p2) => {
		var R = 6378137; // Earth’s mean radius in meter
		var dLat = rad(p2.lat - p1.lat);
		var dLong = rad(p2.lng - p1.lng);
		var a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(rad(p1.lat)) *
				Math.cos(rad(p2.lat)) *
				Math.sin(dLong / 2) *
				Math.sin(dLong / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;
		return d; // returns the distance in meter
	};

	const calc = () => {
		var dist = getDistance(source[0], dest[0]);
		for (var i = 0; i < dest.length - 1; i++) {
			dist += getDistance(dest[i], dest[i + 1]);
		}
		return dist;
	};

	return measure ? (
		<div className="flex flex-col items-center w-screen">
			<div>
				<div>Measure</div>
			</div>
			{source.length > 0 && dest.length > 0 && (
				<div>
					<div>Total Distance</div>
					<div>{calc()} m</div>
				</div>
			)}
		</div>
	) : (
		<></>
	);
}
