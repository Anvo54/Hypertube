import React, { useContext } from 'react';
import DatePickerWidget from 'app/sharedComponents/form/DatePickerWidget';
import { RootStoreContext } from 'app/stores/rootStore';
import { Grid, Dropdown, Rating } from 'semantic-ui-react';
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
		setOrderValue,
		setRatingFilter,
		limitValues,
		genresObj,
		orderBy,
		orderValue,
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
				<Dropdown
					loading={loading}
					compact
					placeholder={t('Order')}
					options={orderValue}
					onChange={(e, { value }) => setOrderValue(value as string)}
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
				<Rating
					clearable="auto"
					icon="star"
					size="mini"
					defaultRating={0}
					maxRating={10}
					onRate={(e, { rating }) => setRatingFilter(rating as number)}
				/>
			</Grid.Column>
			<Grid.Column>
				<DatePickerWidget />
			</Grid.Column>
		</>
	);
};

export default FilterSort;
