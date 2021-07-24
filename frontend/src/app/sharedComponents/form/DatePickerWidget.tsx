import { RootStoreContext } from 'app/stores/rootStore';
import React, { useContext } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DatePickerWidget: React.FC = () => {
	const rootStore = useContext(RootStoreContext);
	const { setStartYear, setEndYear, startYear, endYear } = rootStore.movieStore;

	return (
		<>
			<DatePicker
				selected={startYear}
				onChange={(date) => setStartYear(date as Date)}
				selectsStart
				startDate={startYear}
				endDate={endYear}
				dateFormat="yyyy"
				showYearPicker
				isClearable
			/>
			<DatePicker
				selected={endYear}
				onChange={(date) => setEndYear(date as Date)}
				selectsEnd
				startDate={startYear}
				endDate={endYear}	
				dateFormat="yyyy"
				showYearPicker
				isClearable
			/>
		</>
	);
};

export default DatePickerWidget;
