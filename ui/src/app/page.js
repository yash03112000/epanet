'use client';
import Link from 'next/link';
export default function Home() {
	return (
		<div className="h-screen w-screen flex flex-col justify-center items-center">
			<div>
				<Link href="/route">Route</Link>
			</div>
			<div>
				<Link href="/network">Network</Link>
			</div>
		</div>
	);
}
