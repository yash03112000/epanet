'use client';
import { atom, RecoilRoot, useRecoilState } from 'recoil';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
export default function Home() {
	const [routes, setRoutes] = useState([]);
	const [load, setLoad] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const fun = async () => {
			setLoad(true);
			const res = await axios.get('http://localhost:5000/myRoutes');
			if (res.status == 200) {
				console.log(res.data);
				setRoutes(res.data.routes);
			}
			setLoad(false);
		};
		fun();
	}, []);
	return (
		<RecoilRoot>
			<main className="flex flex-col">
				{load ? (
					<div>Loading..</div>
				) : (
					<div className=" w-screen flex flex-col items-center justify-center">
						<div>Select the route</div>
						{routes.map((route, i) => (
							<div key={i} onClick={() => router.push(`/network/${route._id}`)}>
								{route.name}
							</div>
						))}
					</div>
				)}
			</main>
		</RecoilRoot>
	);
}
