import { useRecoilState, useRecoilValue } from 'recoil';
import { baseMapMenuAtom, mapTypeAtom, mapStyleAtom } from '../atoms/index';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';

const types = ['Default', 'Traffic', 'Transit', 'Biking', 'More'];
const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: '40vw',
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};

const rows = [
	{ title: 'Administrative', a: 'administrative', index: 1 },
	{ title: 'Landscape', a: 'landscape', index: 3 },
	{ title: 'Point of Interest', a: 'poi', index: 5 },
	{ title: 'Road Highway', a: 'road.highway', index: 8 },
	{ title: 'Road Arterial', a: 'road.arterial', index: 10 },
	{ title: 'Road Local', a: 'road.local', index: 12 },
	{ title: 'Transit', a: 'transit', index: 14 },
	{ title: 'Water', a: 'water', index: 16 },
];
export default function BaseMap() {
	const [anchorEl, setAnchorEl] = useRecoilState(baseMapMenuAtom);
	const [mapType, setMapType] = useRecoilState(mapTypeAtom);
	const [mapStyle, setMapStyle] = useRecoilState(mapStyleAtom);
	const [saveModal, setSaveModal] = useState(false);

	const handleClose = (i) => {
		setAnchorEl(null);
	};
	const apply = (n) => {
		if (n === 'More') setSaveModal(true);
		setAnchorEl(null);
		setMapType(n);
	};
	const open = Boolean(anchorEl);

	const handleChange = (a, b, c, d) => {
		var temp = [];

		for (var i = 0; i < mapStyle.length; i++) {
			var obj = structuredClone(mapStyle[i]);

			if (obj.featureType == a && obj.elementType == b) {
				// console.log(obj);
				if (c == 'visibility') obj.stylers[0].visibility = d;
				else obj.stylers[1].lightness = d;
			}

			temp.push(obj);
		}

		setMapStyle(temp);
	};

	return (
		<>
			<Menu
				id="demo-positioned-menu"
				aria-labelledby="demo-positioned-button"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
			>
				{types.map((b, i) => (
					<MenuItem onClick={() => apply(b)} key={i}>
						{b}
					</MenuItem>
				))}
			</Menu>

			<Modal open={saveModal} onClose={() => setSaveModal(false)}>
				<Box sx={style}>
					<TableContainer component={Paper}>
						<Table sx={{ minWidth: 650 }} aria-label="simple table">
							<TableHead>
								<TableRow>
									<TableCell>Elements Properties</TableCell>
									<TableCell align="right">Geometry</TableCell>
									<TableCell align="right">Geometry- lightness</TableCell>
									<TableCell align="right">Labels</TableCell>
									<TableCell align="right">Labels- lightness</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{rows.map((row, i) => (
									<TableRow
										sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
										key={i}
									>
										<TableCell component="th" scope="row">
											{row.title}
										</TableCell>
										<TableCell align="right">
											<Checkbox
												checked={
													mapStyle[row.index].stylers[0].visibility === 'on'
												}
												onChange={(e) =>
													handleChange(
														row.a,
														'geometry',
														'visibility',
														e.target.checked ? 'on' : 'off'
													)
												}
											/>
										</TableCell>
										<TableCell align="right">
											<TextField
												id="filled-number"
												type="number"
												InputLabelProps={{
													shrink: true,
												}}
												variant="standard"
												value={parseFloat(
													mapStyle[row.index].stylers[1].lightness
												)}
												onChange={(e) =>
													handleChange(
														row.a,
														'geometry',
														'lightness',
														e.target.value
													)
												}
											/>
										</TableCell>
										<TableCell align="right">
											<Checkbox
												checked={
													mapStyle[row.index + 1].stylers[0].visibility === 'on'
												}
												onChange={(e) =>
													handleChange(
														row.a,
														'labels',
														'visibility',
														e.target.checked ? 'on' : 'off'
													)
												}
											/>
										</TableCell>
										<TableCell align="right">
											<TextField
												id="filled-number"
												type="number"
												InputLabelProps={{
													shrink: true,
												}}
												variant="standard"
												value={parseFloat(
													mapStyle[row.index + 1].stylers[1].lightness
												)}
												onChange={(e) =>
													handleChange(
														row.a,
														'labels',
														'lightness',
														e.target.value
													)
												}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Box>
			</Modal>
		</>
	);
}
