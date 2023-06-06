import { OptimiseAtom, routeAtom, downloadModalAtom } from '@/atoms/network';
import { useRecoilState, useRecoilValue } from 'recoil';
import Download from './Download';
export default function Toolbar() {
	const [route, setRoute] = useRecoilState(routeAtom);
	const [optimise, setOptimise] = useRecoilState(OptimiseAtom);
	const [downloadModal, setDownloadModal] = useRecoilState(downloadModalAtom);

	const optimiseButFun = () => {
		setOptimise(!optimise);
	};
	const downloadButFun = () => {
		setDownloadModal(!downloadModal);
	};
	return (
		<div className="w-screen h-10 bg-slate-200 flex flex-row justify-evenly items-center my-1 py-4">
			<div>
				<span>{route.name}</span>
			</div>
			<div onClick={optimiseButFun}>
				{optimise ? <span>Show original</span> : <span>Optimise Network</span>}
			</div>
			<div>
				<span onClick={downloadButFun}>Download</span>
			</div>
			<Download />
		</div>
	);
}
