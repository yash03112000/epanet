'use client';
import { useState } from 'react';
import Map from '@/components/Map';
import RouteEditor from '../../components/RouteEditor';
import SaveModal from '@/components/SaveModal';
import { atom, RecoilRoot, useRecoilState } from 'recoil';
import Toolbar from '@/components/Toolbar';
import Measure from '@/components/Measure';
import Details from '@/components/Details';

export default function Home() {
	return (
		<RecoilRoot>
			<main className="flex flex-col">
				<Toolbar />
				<Map />
				<RouteEditor />
				<Measure />
				<SaveModal />
				<Details />
			</main>
		</RecoilRoot>
	);
}
