import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import {
	saveLayerModalAtom,
	sourceAtom,
	destAtom,
	layerListAtom,
} from '../atoms/index';
import Button from '@mui/material/Button';
import { useRecoilState, useRecoilValue } from 'recoil';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

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
export default function SaveLayerModal() {
	const [saveLayerModal, setSaveLayerModal] =
		useRecoilState(saveLayerModalAtom);
	const [layer, setLayer] = useState('');
	const [layerList, setLayerlist] = useRecoilState(layerListAtom);
	const [field, setField] = useState('');
	const source = useRecoilValue(sourceAtom);
	const dest = useRecoilValue(destAtom);

	const saveLayer = () => {
		var temp = [];

		for (var i = 0; i < layerList.length; i++) {
			var obj = structuredClone(layerList[i]);
			console.log(layer);

			if (obj.name == layer) {
				// console.log(obj);
				obj.source = source;
				obj.dest = dest;
			}
			temp.push(obj);
		}
		setLayerlist(temp);
		setField('');
		setSaveLayerModal(false);
	};

	console.log(layerList);

	return (
		<Modal open={saveLayerModal} onClose={() => setSaveLayerModal(false)}>
			<Box sx={style}>
				<div>
					<FormControl fullWidth>
						<InputLabel id="demo-simple-select-label">Select layer</InputLabel>
						<Select
							value={layer}
							label="Layer"
							onChange={(e) => setLayer(e.target.value)}
						>
							{layerList.map((l, i) => (
								<MenuItem value={l.name} key={i}>
									{l.name}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<div className="flex flex-row my-5">
						<TextField
							id="standard-basic"
							label="Add Layer"
							variant="outlined"
							className="mx-2"
							value={field}
							onChange={(e) => setField(e.target.value)}
						/>
						<Button
							variant="outlined"
							onClick={() => {
								setLayerlist((old) => [...old, { name: field }]);
								setField('');
							}}
						>
							Add Layer
						</Button>
					</div>
					<div className="flex justify-center">
						<Button variant="outlined" onClick={saveLayer}>
							Save Layer
						</Button>
					</div>
				</div>
			</Box>
		</Modal>
	);
}
