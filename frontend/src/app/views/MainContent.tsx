import { RootStoreContext } from 'app/stores/rootStore';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Menu, Segment } from 'semantic-ui-react';
import Browse from './movieList/Browse';
import FilterSort from './movieList/FilterSort';
import SearchMovies from './movieList/SearchMovies';

const MainContent: React.FC = () => {
	const { t } = useTranslation();
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
			getMovies()
				.catch(() => {
					toast.error(t('get_movies_failed'));
				})
				.finally(() => setFirstLoad(false));
		}
	}, [firstLoad, getMovies, searchQuery, setSearchQuery, t]);

	/* If Search query changes */

	useEffect(() => {
		if ((savedSearch === '' && searchQuery === '') || !isMounted) return;
		if (savedSearch && searchQuery === savedSearch) return;
		if (searchTimer.current) clearTimeout(searchTimer.current!);
		searchTimer.current = setTimeout(() => {
			setLoading(true);
			setQuery(searchQuery);
			setSearchQuery(searchQuery);
			getMovies()
				.catch(() => {
					toast.error(t('get_movies_failed'));
				})
				.finally(() => {
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
		t,
	]);

	return (
		<div style={{ paddingBottom: 70 }}>
			<Segment
				style={{
					minHeight: 400,
					padding: 30,
					paddingTop: 30,
					marginTop: 80,
				}}
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
		</div>
	);
};

export default observer(MainContent);
