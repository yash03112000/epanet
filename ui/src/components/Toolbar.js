import { useRecoilState, useRecoilValue } from 'recoil';
import {
	newRouteAtom,
	saveModalAtom,
	saveModeAtom,
	bookmarkMenuAtom,
	baseMapMenuAtom,
	mapLoadAtom,
	sourceAtom,
	destAtom,
	measureAtom,
	mapTypeAtom,
	detailsClickAtom,
	routeNameAtom,
	layerListAtom,
	downloadModalAtom,
	measureDestAtom,
	measureSourceAtom,
} from '../atoms/index';
import Bookmark from './Bookmark';
import Search from './Search';
import BaseMap from './BaseMap';
import Download from './Download';
export default function Toolbar() {
	const [newRoute, setnewRoute] = useRecoilState(newRouteAtom);
	const [saveModal, setSaveModal] = useRecoilState(saveModalAtom);
	const [saveMode, setSaveMode] = useRecoilState(saveModeAtom);
	const [anchorEl, setAnchorEl] = useRecoilState(bookmarkMenuAtom);
	const [anchorEl2, setAnchorEl2] = useRecoilState(baseMapMenuAtom);
	const [downloadModal, setDownloadModal] = useRecoilState(downloadModalAtom);
	const [mapLoad, setMapLoad] = useRecoilState(mapLoadAtom);
	const [source, setSource] = useRecoilState(sourceAtom);
	const [dest, setDest] = useRecoilState(destAtom);
	const [measure, setMeasure] = useRecoilState(measureAtom);
	const [mapType, setMapType] = useRecoilState(mapTypeAtom);
	const [detailClick, setDetailClick] = useRecoilState(detailsClickAtom);
	const [routeName, setrouteName] = useRecoilState(routeNameAtom);
	const [layerList, setLayerlist] = useRecoilState(layerListAtom);
	const [measureSource, setMeasureSource] = useRecoilState(measureSourceAtom);
	const [measureDest, setMeasureDest] = useRecoilState(measureDestAtom);

	const routeButFun = () => {
		setnewRoute(false);
		setDetailClick(false);
		setrouteName({ name: '', id: '' });
		setSource([]);
		setDest([]);
		setLayerlist([]);
		setMeasureSource([]);
		setMeasureDest([]);
		setMeasure(false);
	};
	const saveButFun = () => {
		setSaveMode(0);
		setSaveModal(!saveModal);
	};
	const saveAsButFun = () => {
		setSaveMode(1);
		setSaveModal(!saveModal);
	};
	const measureButFun = () => {
		setnewRoute(false);
		setMeasureSource([]);
		setMeasureDest([]);
		setMeasure(!measure);
	};
	const bookmarkButFun = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const baseMapButFun = (event) => {
		setAnchorEl2(event.currentTarget);
	};
	const addLayerFun = () => {
		setSource([]);
		setDest([]);
		setnewRoute(true);
		setDetailClick(false);
		setMeasure(false);
	};
	const detailsFun = () => {
		setnewRoute(false);
		setSource([]);
		setDest([]);
		setDetailClick(true);
	};

	const downloadButFun = () => {
		setDownloadModal(!downloadModal);
	};

	return (
		<div className="w-screen h-10 bg-slate-200 flex flex-row justify-evenly items-center my-1 py-4">
			<div>
				<span onClick={routeButFun}>New Route</span>
			</div>
			<div>
				<span onClick={saveButFun}>Save</span>
			</div>
			<div>
				<span onClick={saveAsButFun}>Save As</span>
			</div>
			<div>
				<span onClick={measureButFun}>Measure</span>
			</div>
			<div>
				<span onClick={bookmarkButFun}>Bookmark</span>
			</div>
			<div>
				<span onClick={baseMapButFun}>BaseMap</span>
			</div>
			<Bookmark />
			<BaseMap />
			<div>
				<span onClick={addLayerFun}>Add</span>
			</div>
			<div>
				<span onClick={detailsFun}>Details</span>
			</div>
			<div>
				<span onClick={downloadButFun}>Download</span>
			</div>
			<Download />
			{mapLoad && <Search />}
		</div>
	);
}
