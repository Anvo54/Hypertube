import React, { useContext, useState } from 'react';
import DatePickerWidget from 'app/sharedComponents/form/DatePickerWidget';
import { RootStoreContext } from 'app/stores/rootStore';
import {
	Grid,
	Dropdown,
	Rating,
	Button,
	Menu,
	Header,
	Popup,
	Divider,
	ButtonGroup,
	Icon,
} from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';

const FilterSort: React.FC = () => {
	const rootStore = useContext(RootStoreContext);
	const [filterMenuOpen, setFilterMenuOpen] = useState(false);
	const [sortMenuOpen, setSortMenuOpen] = useState(false);
	const [ascDesc, setAscDesc] = useState('asc');
	const { t } = useTranslation();
	const {
		setGenre,
		setOrder,
		setOrderValue,
		setRatingFilter,
		ratingVal,
		genre,
		orderVal,
	} = rootStore.movieStore;

	const genresObj = [
		{ key: 'none', text: t('genre'), value: 'none' },
		{ key: 'Action', text: t('action'), value: 'Action' },
		{ key: 'Comedy', text: t('comedy'), value: 'Comedy' },
		{ key: 'Drama', text: t('drama'), value: 'Drama' },
		{ key: 'Fantasy', text: t('fantasy'), value: 'Fantasy' },
		{ key: 'Horror', text: t('horror'), value: 'Horror' },
		{ key: 'Mystery', text: t('mystery'), value: 'Mystery' },
		{ key: 'Romance', text: t('romance'), value: 'Romance' },
		{ key: 'Thriller', text: t('thriller'), value: 'Thriller' },
		{ key: 'Western', text: t('western'), value: 'Western' },
	];

	const orderValue = [
		{ key: 0, text: t('order'), value: 'none' },
		{ key: 1, text: t('title'), value: 'title' },
		{ key: 2, text: t('prodyear'), value: 'year' },
		{ key: 3, text: t('imdb rating'), value: 'rating' },
		{ key: 4, text: t('genre'), value: 'genres' },
	];

	const handleSort = () => {
		ascDesc === 'asc' ? setAscDesc('desc') : setAscDesc('asc');
		setOrder(ascDesc);
	};
	return (
		<>
			<Popup
				trigger={
					<Menu.Item>
						<Icon name="filter" />
						{t('filter')}
					</Menu.Item>
				}
				position="bottom center"
				on="click"
				pinned
				style={{ padding: 10 }}
				open={filterMenuOpen}
				onOpen={() => setFilterMenuOpen(true)}
				onClose={() => setFilterMenuOpen(false)}
			>
				<Header>{t('filter')}</Header>
				<Divider />
				<Grid.Column>
					{t('genre')}
					<br />
					<ButtonGroup>
						<Dropdown
							placeholder={t('genre')}
							options={genresObj}
							onChange={(e, { value }) => setGenre(value as string)}
							floating
							value={genre}
							as={Button}
						/>
					</ButtonGroup>
				</Grid.Column>
				{t('rating')}
				<br />
				<Rating
					icon="star"
					size="mini"
					clearable
					defaultRating={ratingVal}
					maxRating={10}
					onRate={(e, { rating }) => {
						setRatingFilter(rating as number);
					}}
				/>
				<Grid.Column>
					{t('prodyear')}
					<br />
					<DatePickerWidget />
				</Grid.Column>
			</Popup>

			<Popup
				trigger={
					<Menu.Item>
						<Icon name="sort" />
						{t('sort')}
					</Menu.Item>
				}
				position="bottom center"
				on="click"
				label="Sort"
				open={sortMenuOpen}
				onOpen={() => setSortMenuOpen(true)}
				onClose={() => setSortMenuOpen(false)}
			>
				<Header>{t('sort')}</Header>
				<Menu.Item>
					<Grid.Column>
						<Dropdown
							button
							className="icon"
							floating
							labeled
							icon={ascDesc === 'asc' ? 'sort down' : 'sort up'}
							options={orderValue}
							value={orderVal}
							search
							onChange={(e, { value }) => setOrderValue(value as string)}
							placeholder={t('sort')}
							onClick={() => handleSort()}
						/>
					</Grid.Column>
				</Menu.Item>
			</Popup>
		</>
	);
};

export default FilterSort;
