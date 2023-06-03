import { useState, useEffect } from 'react';
import { InfoWindow } from '@react-google-maps/api';
export default function Elevation({ pos, setInfoPos }) {
	const [elev, setElev] = useState(0);

	useEffect(() => {
		const fun = async () => {
			const elevator = new google.maps.ElevationService();
			const a = await elevator.getElevationForLocations({
				locations: [pos],
			});
			console.log(a);
			console.log(a.results);
			console.log(a.results[0]);
			console.log(a.results[0].elevation);
			setElev(a.results[0].elevation);
		};
		fun();
	}, [pos]);
	return (
		<InfoWindow position={pos} onCloseClick={() => setInfoPos(null)}>
			<div>
				<h1>Elevation:</h1>
				<span>{elev}</span>
			</div>
		</InfoWindow>
	);
}
