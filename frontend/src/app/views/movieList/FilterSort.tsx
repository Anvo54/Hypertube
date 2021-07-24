import React, { useContext, useState } from 'react';
import DatePickerWidget from 'app/sharedComponents/form/DatePickerWidget';
import { RootStoreContext } from 'app/stores/rootStore';
import {
	Grid,
	Dropdown,
	Rating,
	Button,
	Menu,
	Container,
	Header,
	Popup,
	Item,
	Divider,
} from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';

interface IProps {
	loading: boolean;
}

const FilterSort: React.FC<IProps> = ({ loading }) => {
	const rootStore = useContext(RootStoreContext);
	const [filterMenuOpen, setFilterMenuOpen] = useState(false);
	const [sortMenuOpen, setSortMenuOpen] = useState(false);
	const [curRating, setCurRating] = useState(0);
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
		{ key: 'none', text: '', value: 'none' },
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

	const orderBy = [
		{ key: 0, text: t('ascending'), value: 'asc' },
		{ key: 1, text: t('descending'), value: 'desc' },
	];
	const orderValue = [
		{ key: 0, text: '', value: 'none' },
		{ key: 1, text: t('title'), value: 'title' },
		{ key: 2, text: t('year'), value: 'year' },
		{ key: 3, text: t('imdb rating'), value: 'rating' },
		{ key: 4, text: t('genre'), value: 'genres' },
	];

	return (
		<>
			<Menu>
				<Container>
					<Menu.Menu>
						<Popup
							trigger={<Menu.Item icon="filter" />}
							position="bottom center"
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
									<Item>
										<Item.Header as="h4">Genre</Item.Header>
										<Item.Content>
											<Dropdown
												loading={loading}
												compact
												placeholder={t('genre')}
												options={genresObj}
												onChange={(e, { value }) => setGenre(value as string)}
											/>
										</Item.Content>
									</Item>
								</Grid.Column>
								<Grid.Column>
									<Item>
										<Item.Header as="h4">Imdb rating</Item.Header>
										<Rating
											icon="star"
											size="mini"
											defaultRating={0}
											maxRating={10}
											loading={loading}
											rating={curRating}
											onRate={(e, { rating }) => {
												setCurRating(rating as number);
												setRatingFilter(rating as number);
											}}
										/>
										<Button
											content="Clear rating"
											size="mini"
											loading={loading}
											color="red"
											onClick={() => {
												setCurRating(0);
												setRatingFilter(-1);
											}}
										/>
									</Item>
								</Grid.Column>
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
									<Dropdown
										loading={loading}
										compact
										placeholder={t('order')}
										options={orderValue}
										onChange={(e, { value }) => setOrderValue(value as string)}
									/>
									<Dropdown
										loading={loading}
										compact
										placeholder={t('order_by')}
										options={orderBy}
										onChange={(e, { value }) => setOrder(value as string)}
										simple
									/>
								</Grid.Column>
							</Menu.Item>
						</Popup>
					</Menu.Menu>
					<Grid.Column floated="right">
						<Dropdown
							options={limitValues}
							compact
							loading={loading}
							placeholder={t('limit')}
							onChange={(e, { value }) => setResultLimit(value as number)}
						/>
					</Grid.Column>
				</Container>
			</Menu>
		</>
	);
};

export default FilterSort;
