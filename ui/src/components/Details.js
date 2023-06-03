import { useRecoilState, useRecoilValue } from 'recoil';
import {
	detailsClickAtom,
	routeNameAtom,
	layerListAtom,
	sourceAtom,
	destAtom,
	runAtom,
} from '../atoms/index';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import { useState } from 'react';

export default function Details() {
	const detVis = useRecoilValue(detailsClickAtom);
	const routeName = useRecoilValue(routeNameAtom);
	const layerList = useRecoilValue(layerListAtom);

	return detVis ? (
		<div className="flex flex-col justify-center items-center">
			<h1>Details</h1>
			<div>
				<span>Route Name:</span>
				<span>{routeName.name}</span>
			</div>
			<div>
				{layerList.map((layer, i) => (
					<DetailItem key={i} layer={layer} />
				))}
			</div>
		</div>
	) : (
		<></>
	);
}

const DetailItem = ({ layer }) => {
	const [run, setRun] = useRecoilState(runAtom);
	const [source, setSource] = useRecoilState(sourceAtom);
	const [dest, setDest] = useRecoilState(destAtom);
	const [dis, setDis] = useState([]);
	const analysefun = () => {
		var service = new google.maps.DistanceMatrixService();
		service.getDistanceMatrix(
			{
				origins: layer.source,
				destinations: layer.dest,
				travelMode: 'DRIVING',
			},
			callback
		);

		function callback(res, status) {
			console.log(res);
			console.log(status);
			if (status == 'OK') {
				setDis(res.rows[0].elements);
			}
		}
	};

	const fun = (ind) => {
		if (dis.length > ind) {
			if (dis[ind].status === 'OK') {
				return <span>---{dis[ind].distance.text}</span>;
			} else {
				return <span>---No Path</span>;
			}
		}
	};
	return (
		<Accordion>
			<AccordionSummary
				expandIcon={<ExpandMoreIcon />}
				aria-controls="panel1a-content"
				id="panel1a-header"
			>
				<Typography>{layer.name}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<div className="flex flex-col">
					<span>Source:</span>
					{layer.source.map((item, ind) => (
						<div key={ind}>
							S---{item.lat.toFixed(6)},{item.lng.toFixed(6)}
						</div>
					))}
					<span>Destinations:</span>
					{layer.dest.map((item, ind) => (
						<div key={ind}>
							D{ind}--{item.lat.toFixed(6)},{item.lng.toFixed(6)}
							{fun(ind)}
						</div>
					))}
				</div>
				<div>
					<Button
						variant="outlined"
						onClick={() => {
							if (!run) {
								setSource(layer.source);
								setDest(layer.dest);
								setRun(true);
							} else {
								setRun(false);
								setSource([]);
								setDest([]);
							}
						}}
					>
						Run
					</Button>
					<Button variant="outlined" onClick={analysefun}>
						Analyse
					</Button>
				</div>
			</AccordionDetails>
		</Accordion>
	);
};
