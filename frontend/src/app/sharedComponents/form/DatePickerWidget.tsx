import { RootStoreContext } from 'app/stores/rootStore';
import React, { useContext } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { GridRow } from 'semantic-ui-react';

const DatePickerWidget: React.FC = () => {
	const rootStore = useContext(RootStoreContext);
	const { setStartYear, setEndYear, startYear, endYear } = rootStore.movieStore;

	return (
		<>
			<GridRow>
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
			</GridRow>
			-
			<br />
			<GridRow>
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
			</GridRow>
		</>
	);
};

export default DatePickerWidget;
