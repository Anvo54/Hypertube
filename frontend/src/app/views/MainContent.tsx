import SearchMovies from 'app/views/movieList/SearchMovies';
import { RootStoreContext } from 'app/stores/rootStore';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Dropdown, Grid, Segment } from 'semantic-ui-react';
import Browse from './movieList/Browse';
import { useTranslation } from 'react-i18next';

const MainContent: React.FC = () => {
	const rootStore = useContext(RootStoreContext);
	const { t } = useTranslation();
	const {
		getMovies,
		getNextPage,
		setResultLimit,
		setGenre,
		setOrder,
		limitValues,
		genresObj,
		genre,
		prevGenre,
		movies,
		savedSearch,
		orderBy,
		page,
		movieQueryLength,
	} = rootStore.movieStore;
	const searchTimer = useRef<NodeJS.Timeout>();
	const [searchQuery, setQuery] = useState(savedSearch);
	const [firstLoad, setFirstLoad] = useState(true);
	const [loading, setLoading] = useState(false);
	const [pageNbr, setpageNb] = useState(0);

	/* Get initial movie list */
	useEffect(() => {
		if (firstLoad) {
			setLoading(true);
			getMovies(searchQuery).then(() => {
				setFirstLoad(false);
				setLoading(false);
			});
		}
	}, [firstLoad, getMovies, searchQuery]);

	/* If Page Changes */

	useEffect(() => {
		if (pageNbr !== page) {
			setLoading(true);
			getMovies(searchQuery).then(() => {
				setLoading(false);
				setpageNb(page);
			});
		}
	}, [getMovies, page, pageNbr, searchQuery]);

	/* If Search query changes */

	useEffect(() => {
		if (savedSearch === '' && searchQuery === '') return;
		if (savedSearch && searchQuery === savedSearch) return;
		if (searchTimer.current) clearTimeout(searchTimer.current!);
		searchTimer.current = setTimeout(() => {
			setLoading(true);
			getMovies(searchQuery).then(() => setLoading(false));
		}, 700);
		return () => {
			if (searchTimer.current) clearTimeout(searchTimer.current!);
		};
	}, [searchQuery, getMovies, savedSearch]);

	/* If Genre changes */

	useEffect(() => {
		if (genre !== prevGenre) {
			setLoading(true);
			getMovies(searchQuery).then(() => setLoading(false));
		}
	}, [genre, getMovies, prevGenre, searchQuery]);

	return (
		<Segment style={{ minHeight: 500, padding: 60 }}>
			<Grid columns="equal">
				<Grid.Row>
					<SearchMovies
						setQuery={setQuery}
						searchQuery={searchQuery}
						loading={loading}
					/>
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
				</Grid.Row>
			</Grid>
			<Browse
				loading={loading}
				movies={movies.movies}
				getNextPage={getNextPage}
				movieQueryLength={movieQueryLength}
			/>
		</Segment>
	);
};

export default observer(MainContent);
