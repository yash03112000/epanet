import { atom } from 'recoil';

export const routeAtom = atom({
	key: 'route',
	default: {},
});

export const OptimiseAtom = atom({
	key: 'optimise',
	default: false,
});

export const downloadModalAtom = atom({
	key: 'downloadModal',
	default: false,
});

export const optimisePathAtom = atom({
	key: 'optimisePath',
	default: [],
});

export const junctionsAtom = atom({
	key: 'junctions',
	default: [],
});
