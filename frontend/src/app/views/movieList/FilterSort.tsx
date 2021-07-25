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
} from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';

const FilterSort: React.FC = () => {
	const rootStore = useContext(RootStoreContext);
	const [filterMenuOpen, setFilterMenuOpen] = useState(false);
	const [sortMenuOpen, setSortMenuOpen] = useState(false);
	const [ascDesc, setAscDesc] = useState('asc');
	const { t } = useTranslation();
	const {
		setResultLimit,
		setGenre,
		setOrder,
		setOrderValue,
		setRatingFilter,
		limitValues,
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
		{ key: 2, text: t('year'), value: 'year' },
		{ key: 3, text: t('imdb rating'), value: 'rating' },
		{ key: 4, text: t('genre'), value: 'genres' },
	];

	const handleSort = () => {
		ascDesc === 'asc' ? setAscDesc('desc') : setAscDesc('asc');
		setOrder(ascDesc);
	};

	return (
		<>
			<Menu>
				<Menu.Menu>
					<Popup
						trigger={<Menu.Item icon="filter" />}
						position="bottom left"
						on="click"
						pinned
						style={{ padding: 10 }}
						open={filterMenuOpen}
						onOpen={() => setFilterMenuOpen(true)}
						onClose={() => setFilterMenuOpen(false)}
					>
						<Menu.Item>
							<Header>{t('filter')}</Header>
							<Divider />
							<Grid.Column>
								<ButtonGroup>
									<Dropdown
										placeholder={t('genre')}
										options={genresObj}
										onChange={(e, { value }) => setGenre(value as string)}
										button
										floating
										labeled
									/>
								</ButtonGroup>
							</Grid.Column>
							<Rating
								icon="star"
								size="mini"
								clearable
								defaultRating={0}
								maxRating={10}
								onRate={(e, { rating }) => {
									setRatingFilter(rating as number);
								}}
							/>
							<Grid.Column>
								<DatePickerWidget />
							</Grid.Column>
						</Menu.Item>
					</Popup>
				</Menu.Menu>
				<Menu.Menu>
					<Popup
						trigger={<Menu.Item icon="sort" />}
						position="bottom center"
						on="click"
						pinned
						label="Sort"
						style={{ padding: 10 }}
						open={sortMenuOpen}
						onOpen={() => setSortMenuOpen(true)}
						onClose={() => setSortMenuOpen(false)}
					>
						<Menu.Item>
							<Header>{t('sort')}</Header>
						</Menu.Item>
						<Menu.Item>
							<Grid.Column>
								<ButtonGroup>
									<Dropdown
										button
										className="icon"
										floating
										labeled
										icon="sort"
										options={orderValue}
										search
										onChange={(e, { value }) => setOrderValue(value as string)}
										placeholder={t('sort')}
									/>
									<Button
										icon={ascDesc === 'asc' ? 'sort down' : 'sort up'}
										onClick={() => handleSort()}
									/>
								</ButtonGroup>
							</Grid.Column>
						</Menu.Item>
						<Menu.Item>
							<Grid.Column floated="right">
								<Dropdown
									options={limitValues}
									compact
									placeholder={t('limit')}
									onChange={(e, { value }) => setResultLimit(value as number)}
								/>
							</Grid.Column>
						</Menu.Item>
					</Popup>
				</Menu.Menu>
			</Menu>
		</>
	);
};

export default FilterSort;
