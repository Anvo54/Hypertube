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
				selected={new Date(startYear)}
				onChange={(date) => setStartYear(date as Date)}
				selectsStart
				startDate={new Date(startYear)}
				endDate={new Date(endYear)}
				dateFormat="yyyy"
				showYearPicker
			/>
			<DatePicker
				selected={new Date(endYear)}
				onChange={(date) => setEndYear(date as Date)}
				selectsEnd
				startDate={new Date(startYear)}
				endDate={new Date(endYear)}
				dateFormat="yyyy"
				showYearPicker
			/>
		</>
	);
};

export default DatePickerWidget;
