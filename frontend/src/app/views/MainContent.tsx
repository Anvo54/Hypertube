import { RootStoreContext } from 'app/stores/rootStore';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Menu, Segment } from 'semantic-ui-react';
import Browse from './movieList/Browse';
import FilterSort from './movieList/FilterSort';
import SearchMovies from './movieList/SearchMovies';

const MainContent: React.FC = () => {
	const rootStore = useContext(RootStoreContext);
	const {
		getMovies,
		getNextPage,
		setSearchQuery,
		setLoading,
		loading,
		movies,
		savedSearch,
		page,
		totalPages,
	} = rootStore.movieStore;
	const searchTimer = useRef<NodeJS.Timeout>();
	const [searchQuery, setQuery] = useState(savedSearch);
	const [firstLoad, setFirstLoad] = useState(true);
	const [isMounted, setIsMounted] = useState(true);

	useEffect(() => {
		return () => setIsMounted(false);
	}, []);

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
		if ((savedSearch === '' && searchQuery === '') || !isMounted) return;
		if (savedSearch && searchQuery === savedSearch) return;
		if (searchTimer.current) clearTimeout(searchTimer.current!);
		searchTimer.current = setTimeout(() => {
			setLoading(true);
			setQuery(searchQuery);
			setSearchQuery(searchQuery);
			getMovies().then(() => {
				if (isMounted) setLoading(false);
			});
		}, 700);
		return () => {
			if (searchTimer.current) clearTimeout(searchTimer.current!);
		};
	}, [
		searchQuery,
		savedSearch,
		isMounted,
		getMovies,
		setLoading,
		setSearchQuery,
	]);

	return (
		<Segment
			style={{ minHeight: 500, padding: 30, paddingTop: 30, marginTop: 80 }}
		>
			<Menu stackable borderless>
				<SearchMovies
					setQuery={setQuery}
					searchQuery={searchQuery}
					loading={loading}
				/>
				<FilterSort />
			</Menu>
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
