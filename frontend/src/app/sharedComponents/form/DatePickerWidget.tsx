import { RootStoreContext } from 'app/stores/rootStore';
import React, { useContext } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { GridRow } from 'semantic-ui-react';

const DatePickerWidget: React.FC = () => {
	const { t } = useTranslation();
	const rootStore = useContext(RootStoreContext);
	const { setStartYear, setEndYear, startYear, endYear } = rootStore.movieStore;

	return (
		<>
			<GridRow>
				<DatePicker
					selected={startYear}
					onChange={(date) =>
						setStartYear(date as Date).catch(() =>
							toast.error(t('get_more_movies_failed'))
						)
					}
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
					onChange={(date) =>
						setEndYear(date as Date).catch(() =>
							toast.error(t('get_more_movies_failed'))
						)
					}
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
