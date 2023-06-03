import usePlacesAutocomplete, {
	getGeocode,
	getLatLng,
} from 'use-places-autocomplete';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { mapAtom } from '../atoms/index';
import { useRecoilState, useRecoilValue } from 'recoil';

export default function Search() {
	const [map, setMap] = useRecoilState(mapAtom);

	const {
		ready,
		value,
		setValue,
		suggestions: { status, data },
		clearSuggestions,
	} = usePlacesAutocomplete();

	const handleSelect = async (e, v) => {
		// console.log(v);
		if (v) {
			let address = v.description;
			setValue(address, false);
			clearSuggestions();

			const results = await getGeocode({ address });
			const { lat, lng } = await getLatLng(results[0]);
			// console.log(lat, lng);
			map.setBookmark({ center: { lat: lat, lng: lng }, zoom: 10 });
		}
	};
	// console.log(ready);
	// console.log(status);
	// console.log(data);

	return (
		<Autocomplete
			disablePortal
			id="combo-box-demo"
			options={data}
			sx={{ width: 300 }}
			disabled={!ready}
			renderInput={(params) => (
				<TextField
					{...params}
					label="Search"
					onChange={(e) => setValue(e.target.value)}
				/>
			)}
			getOptionLabel={(opt) => opt.description}
			renderOption={(props, option, i) => {
				// console.log(props);
				// console.log(option);
				// console.log(i);
				return (
					<li {...props} key={i.index}>
						{option.description}
					</li>
				);
			}}
			onChange={handleSelect}
		/>
	);
}
