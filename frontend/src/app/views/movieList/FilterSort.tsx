import React, { useContext } from 'react';
import DatePickerWidget from 'app/sharedComponents/form/DatePickerWidget';
import { RootStoreContext } from 'app/stores/rootStore';
import { Grid, Dropdown } from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';

interface IProps {
	loading: boolean;
}

const FilterSort: React.FC<IProps> = ({ loading }) => {
	const rootStore = useContext(RootStoreContext);
	const { t } = useTranslation();
	const {
		setResultLimit,
		setGenre,
		setOrder,
		limitValues,
		genresObj,
		orderBy,
	} = rootStore.movieStore;
	return (
		<>
			<Grid.Column>
				<Dropdown
					loading={loading}
					compact
					placeholder={t('genre')}
					options={genresObj}
					onChange={(e, { value }) => setGenre(value as string)}
				/>
			</Grid.Column>
			<Grid.Column>
				<Dropdown
					loading={loading}
					compact
					placeholder={t('order_by')}
					options={orderBy}
					onChange={(e, { value }) => setOrder(value as string)}
				/>
			</Grid.Column>
			<Grid.Column>
				<Dropdown
					options={limitValues}
					compact
					placeholder={t('limit')}
					onChange={(e, { value }) => setResultLimit(value as number)}
				/>
			</Grid.Column>
			<Grid.Column>
				<DatePickerWidget />
			</Grid.Column>
		</>
	);
};

export default FilterSort;
