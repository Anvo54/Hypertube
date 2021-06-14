import SearchMovies from 'app/views/movieList/SearchMovies';
import { RootStoreContext } from 'app/stores/rootStore';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Segment } from 'semantic-ui-react';
import Browse from './movieList/Browse';

const MainContent: React.FC = () => {
	const rootStore = useContext(RootStoreContext);
	const {
		getMovies,
		getNextPage,
		movies,
		savedSearch,
		page,
		movieQueryLength,
	} = rootStore.movieStore;
	const searchTimer = useRef<NodeJS.Timeout>();
	const [searchQuery, setQuery] = useState(savedSearch);
	const [loading, setLoading] = useState(false);
	const [pageNbr, setpageNb] = useState(0);

	useEffect(() => {
		if (pageNbr !== page && movies.count === 0) {
			setLoading(true);
			getMovies(searchQuery).then(() => setLoading(false));
			setpageNb(page);
			return;
		}
		if (savedSearch !== '' || pageNbr === page || movieQueryLength === 0)
			return;
		setLoading(true);
		getMovies(searchQuery).then(() => setLoading(false));
		setpageNb(page);
	}, [
		getMovies,
		movies.count,
		savedSearch,
		searchQuery,
		pageNbr,
		page,
		movieQueryLength,
	]);

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

	return (
		<Segment style={{ minHeight: 500, padding: 60 }}>
			<SearchMovies
				setQuery={setQuery}
				searchQuery={searchQuery}
				loading={loading}
			/>
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
