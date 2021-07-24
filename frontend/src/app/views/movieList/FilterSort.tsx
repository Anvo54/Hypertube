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
} from 'semantic-ui-react';
import { useTranslation } from 'react-i18next';

interface IProps {
	loading: boolean;
}

const FilterSort: React.FC<IProps> = ({ loading }) => {
	const rootStore = useContext(RootStoreContext);
	const [menuOpen, setMenuOpen] = useState(false);
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
			<Menu>
				<Container>
					<Menu.Menu>
						<Popup
							trigger={
								<Menu.Item>
									<Header>Filter & Sort</Header>
								</Menu.Item>
							}
							position="bottom center"
							on="click"
							pinned
							style={{ padding: 10 }}
							open={menuOpen}
							onOpen={() => setMenuOpen(true)}
							onClose={() => setMenuOpen(false)}
						>
							<Menu.Item>
								<Header>Filter</Header>
								<Grid.Column>
									<Dropdown
										loading={loading}
										compact
										placeholder={t('genre')}
										options={genresObj}
										onChange={(e, { value }) => setGenre(value as string)}
									/>
								</Grid.Column>
							</Menu.Item>
							<Menu.Item>
								<Grid.Column>
									<Rating
										icon="star"
										size="mini"
										defaultRating={0}
										maxRating={10}
										onRate={(e, { rating }) =>
											setRatingFilter(rating as number)
										}
									/>
									<Button
										content="Clear rating"
										size="mini"
										color="red"
										onClick={() => setRatingFilter(-1)}
									/>
								</Grid.Column>
								<Grid.Column>
									<DatePickerWidget />
								</Grid.Column>
							</Menu.Item>
							<Menu.Item>
								<Grid.Column>
									<Header>Sort</Header>
									<Dropdown
										loading={loading}
										compact
										placeholder={t('Order')}
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
