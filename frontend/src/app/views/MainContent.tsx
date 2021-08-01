import SearchMovies from 'app/views/movieList/SearchMovies';
import { RootStoreContext } from 'app/stores/rootStore';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Segment } from 'semantic-ui-react';
import Browse from './movieList/Browse';
import FilterSort from './movieList/FilterSort';

const MainContent: React.FC = () => {
	const rootStore = useContext(RootStoreContext);
	const {
		getMovies,
		getNextPage,
		setSearchQuery,
		loading,
		movies,
		savedSearch,
		page,
		totalPages,
	} = rootStore.movieStore;
	const searchTimer = useRef<NodeJS.Timeout>();
	const [searchQuery, setQuery] = useState(savedSearch);
	const [firstLoad, setFirstLoad] = useState(true);

	/* Get initial movie list */
	useEffect(() => {
		if (firstLoad) {
			getMovies().then(() => {
				setFirstLoad(false);
			});
		}
	}, [firstLoad, getMovies, searchQuery, setSearchQuery]);

	/* If Search query changes */

	useEffect(() => {
		if (searchTimer.current) clearTimeout(searchTimer.current!);
		searchTimer.current = setTimeout(() => {
			setQuery(searchQuery);
			setSearchQuery(searchQuery);
		}, 700);
		return () => {
			if (searchTimer.current) clearTimeout(searchTimer.current!);
		};
	}, [searchQuery, savedSearch, setSearchQuery]);

	return (
		<Segment style={{ minHeight: 500, padding: 60 }}>
			<SearchMovies
				setQuery={setQuery}
				searchQuery={searchQuery}
				loading={loading}
			/>
			<FilterSort />

			<Browse
				loading={loading}
				movies={movies.movies}
				getNextPage={getNextPage}
				totalPages={totalPages}
				page={page}
			/>
		</Segment>
	);
};

export default observer(MainContent);
