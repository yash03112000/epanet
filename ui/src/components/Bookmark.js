import { useRecoilState, useRecoilValue } from 'recoil';
import { bookmarkMenuAtom, bookmarksAtom, mapAtom } from '../atoms/index';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useState, useMemo } from 'react';

export default function Bookmark() {
	const [anchorEl, setAnchorEl] = useRecoilState(bookmarkMenuAtom);
	const [bookmarks, setBookmarks] = useRecoilState(bookmarksAtom);

	const [map, setMap] = useRecoilState(mapAtom);
	const [field, setField] = useState('');

	const handleClose = (i) => {
		setAnchorEl(null);
	};
	const apply = (i) => {
		map.setBookmark(bookmarks[i].property);
		setAnchorEl(null);
	};

	const addBookmark = () => {
		setBookmarks((old) => [
			...old,
			{
				name: field,
				property: map.getBookmark(),
			},
		]);
		setField('');
	};

	const open = Boolean(anchorEl);

	return (
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
			<div className="flex flex-row my-5">
				<TextField
					variant="standard"
					className="mx-2"
					value={field}
					onChange={(e) => setField(e.target.value)}
				/>
				<Button
					variant="standard"
					onClick={() => {
						addBookmark();
					}}
				>
					Save Route
				</Button>
			</div>
			{bookmarks.map((b, i) => (
				<MenuItem onClick={() => apply(i)} key={i}>
					{b.name}
				</MenuItem>
			))}
		</Menu>
	);
}
