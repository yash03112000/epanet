'use client';
import { atom, RecoilRoot, useRecoilState } from 'recoil';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Network from '@/components/Network/Network';
export default function Home({ params }) {
	return (
		<RecoilRoot>
			<main className="flex flex-col">
				<Network id={params.id} />
			</main>
		</RecoilRoot>
	);
}
