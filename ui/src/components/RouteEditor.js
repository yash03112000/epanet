import { useRecoilState, useRecoilValue } from 'recoil';
import {
	sourceAtom,
	destAtom,
	newRouteAtom,
	runAtom,
	saveLayerModalAtom,
} from '../atoms/index';
import Button from '@mui/material/Button';
import SaveLayerModal from './SaveLayerModal';

export default function RouteEditor() {
	const [source, setSource] = useRecoilState(sourceAtom);
	const [dest, setDest] = useRecoilState(destAtom);
	const [run, setRun] = useRecoilState(runAtom);
	const [saveLayerModal, setSaveLayerModal] =
		useRecoilState(saveLayerModalAtom);

	const newRoute = useRecoilValue(newRouteAtom);

	return newRoute ? (
		<div className="flex flex-col items-center w-screen">
			<div>
				<div>New Route</div>
			</div>
			<div className="flex flex-row w-full">
				<div className="w-1/2 flex flex-col items-center">
					<span>Source</span>
					<div className="w-80 h-80 border-2 rounded-lg flex flex-col items-center overflow-auto">
						{source.map((item, i) => (
							<span key={i}>
								S--{item.lat.toFixed(6)},{item.lng.toFixed(6)}
							</span>
						))}
					</div>
				</div>
				<div className="w-1/2 flex flex-col items-center">
					<span>Destinations</span>
					<div className="w-80 h-80 border-2 rounded-lg flex flex-col items-center overflow-auto">
						{dest.map((item, i) => (
							<span key={i}>
								D{i}--{item.lat.toFixed(6)},{item.lng.toFixed(6)}
							</span>
						))}
					</div>
				</div>
			</div>
			<div className="flex flex-row w-full justify-around">
				<Button variant="outlined" onClick={() => setRun(!run)}>
					Run
				</Button>
				<Button variant="outlined" onClick={() => setSaveLayerModal(true)}>
					Save
				</Button>
			</div>
			<SaveLayerModal />
		</div>
	) : (
		<></>
	);
}
