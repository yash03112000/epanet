import { atom } from 'recoil';
import gMapStyles from './gmapstyles';
export const sourceAtom = atom({
	key: 'source',
	default: [],
});
export const destAtom = atom({
	key: 'dest',
	default: [],
});

export const newRouteAtom = atom({
	key: 'newRoute',
	default: false,
});
export const measureAtom = atom({
	key: 'measure',
	default: false,
});
export const runAtom = atom({
	key: 'run',
	default: false,
});

export const saveLayerModalAtom = atom({
	key: 'saveLayerModal',
	default: false,
});
export const saveModalAtom = atom({
	key: 'saveModal',
	default: false,
});
export const saveModeAtom = atom({
	key: 'saveMode',
	default: 0,
});
export const routeNameAtom = atom({
	key: 'routeName',
	default: { name: '', id: '' },
});
export const bookmarksAtom = atom({
	key: 'bookmarks',
	default: [],
});
export const bookmarkMenuAtom = atom({
	key: 'bookmarkMenu',
	default: false,
});
export const baseMapMenuAtom = atom({
	key: 'baseMapMenu',
	default: false,
});
export const downloadMenuAtom = atom({
	key: 'downloadMenu',
	default: false,
});
export const mapAtom = atom({
	key: 'mapS',
	default: undefined,
});
export const mapLoadAtom = atom({
	key: 'mapLoad',
	default: false,
});
export const mapTypeAtom = atom({
	key: 'maptype',
	default: 'none',
});
export const mapStyleAtom = atom({
	key: 'mapStyle',
	default: gMapStyles,
});

export const layerListAtom = atom({
	key: 'layerList',
	default: [],
});

export const detailsClickAtom = atom({
	key: 'detailClick',
	default: false,
});
