import { useRecoilState, useRecoilValue } from 'recoil';
import { downloadModalAtom, optimisePathAtom } from '@/atoms/network';
import axios from 'axios';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};
export default function Download() {
	const [downloadModal, setDownloadModal] = useRecoilState(downloadModalAtom);
	const [optimisePath, setOptimisePath] = useRecoilState(optimisePathAtom);

	const saveFile = async (blob, name) => {
		const a = document.createElement('a');
		a.download = name;
		a.href = URL.createObjectURL(blob);
		a.addEventListener('click', (e) => {
			setTimeout(() => URL.revokeObjectURL(a.href), 30 * 1000);
		});
		a.click();
	};

	const getGeoJSON = () => {
		var a = {};
		a.type = 'FeatureCollection';
		a.features = [];
		console.log(optimisePath);

		for (let path of optimisePath) {
			console.log(path);
			var b = {};
			b.type = 'Feature';
			var c = {};
			c.type = 'LineString';
			c.coordinates = [];
			for (let p of path) {
				c.coordinates.push([p.lng, p.lat]);
			}
			b.geometry = c;
			b.properties = {};
			b.properties.id = 1;
			a.features.push(b);
		}
		return a;
	};

	const apply = async (type) => {
		if (optimisePath.length == 0) {
			alert('Kindly optimise path first');
		} else {
			var geoJson = getGeoJSON();
			console.log(geoJson);
			let contentType = 'application/json;charset=utf-8;';
			if (type === 'geojson') {
				var blob = new Blob(
					[decodeURIComponent(encodeURI(JSON.stringify(geoJson)))],
					{
						type: contentType,
					}
				);
				saveFile(blob, 'g2.json');
			} else {
				const res = await axios.post('http://localhost:5000/tokml', {
					json: geoJson,
				});
				console.log(res.data.data);
				var blob = new Blob([res.data.data], { type: 'text/plain' });
				saveFile(blob, 'g2.kml');
			}
		}

		setDownloadModal(false);
	};

	return (
		<Modal open={downloadModal} onClose={() => setDownloadModal(false)}>
			<Box sx={style}>
				<div className="flex flex-row my-5">
					<Button variant="outlined" onClick={() => apply('geojson')}>
						GeoJson
					</Button>
					<Button variant="outlined" onClick={() => apply('kml')}>
						KML
					</Button>
				</div>
			</Box>
		</Modal>
	);
}
