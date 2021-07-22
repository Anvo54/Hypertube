import SearchMovies from 'app/views/movieList/SearchMovies';
import { RootStoreContext } from 'app/stores/rootStore';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Grid, Segment } from 'semantic-ui-react';
import Browse from './movieList/Browse';
import FilterSort from './movieList/FilterSort';

const MainContent: React.FC = () => {
	const rootStore = useContext(RootStoreContext);
	const {
		getMovies,
		getNextPage,
		genre,
		prevGenre,
		movies,
		savedSearch,
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
					<FilterSort loading={loading} />
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
