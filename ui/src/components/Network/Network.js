import { atom, RecoilRoot, useRecoilState } from 'recoil';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { routeAtom } from '@/atoms/network';
import Map from './Map.js';
import Toolbar from './Toolbar.js';
export default function Network({ id }) {
	const [route, setRoute] = useRecoilState(routeAtom);
	const [load, setLoad] = useState(true);
	const routeId = id;

	useEffect(() => {
		const fun = async () => {
			const res = await axios.get('http://localhost:5000/getRoute/' + routeId);
			if (res.status == 200) {
				setRoute(res.data.route);
			}
			setLoad(false);
		};
		fun();
	}, []);
	return load ? (
		<div>Loading..</div>
	) : (
		<div className="">
			<Toolbar />
			<Map />
		</div>
	);
}
