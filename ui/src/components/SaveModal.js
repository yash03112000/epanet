import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import {
	saveModalAtom,
	routeNameAtom,
	saveModeAtom,
	layerListAtom,
} from '../atoms/index';
import Button from '@mui/material/Button';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useState, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import axios from 'axios';

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
export default function SaveModal() {
	const [saveModal, setSaveModal] = useRecoilState(saveModalAtom);
	const [routeName, setrouteName] = useRecoilState(routeNameAtom);
	const layerList = useRecoilValue(layerListAtom);
	const saveMode = useRecoilValue(saveModeAtom);
	const [field, setField] = useState(routeName);

	useMemo(() => {
		if (saveMode == 0) setField(routeName.name);
		else setField('');
	}, [saveModal]);

	const handleChange = async () => {
		console.log(field);
		var obj = structuredClone(routeName);
		console.log(obj);
		obj.name = field;
		console.log(obj);

		const res = await axios.post('http://localhost:5000/saveRoute', {
			body: obj,
			mode: saveMode,
			layers: layerList,
		});
		console.log(res);
		const body = res.data;
		obj.id = body._id;
		setrouteName(obj);
		setField('');
		setSaveModal(false);
	};

	return (
		<Modal open={saveModal} onClose={() => setSaveModal(false)}>
			<Box sx={style}>
				<div className="flex flex-row items-center justify-center">
					{saveMode === 0 ? <span>Save</span> : <span>Save As</span>}
				</div>
				<div className="flex flex-row my-5">
					<TextField
						id="standard-basic"
						label="Save Route"
						variant="outlined"
						className="mx-2"
						value={field}
						onChange={(e) => setField(e.target.value)}
					/>
					<Button variant="outlined" onClick={handleChange}>
						Save Route
					</Button>
				</div>
			</Box>
		</Modal>
	);
}
