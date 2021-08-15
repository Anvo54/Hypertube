import { RootStoreContext } from 'app/stores/rootStore';
import { observer } from 'mobx-react-lite';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import ReactPlayer from 'react-player';
import { toast } from 'react-toastify';
import MovieLoader from './MovieLoader';

const MoviePlayer = (): JSX.Element => {
	const { t } = useTranslation();
	const rootStore = useContext(RootStoreContext);
	const { movie, getSubtitles, setWatched } = rootStore.movieStore;

	if (!movie) return <MovieLoader />;

	const checkWatched = (played: number) => {
		if (played > 0.9 && !movie.watched) {
			setWatched().catch(() => toast.info(t('set_watched_failed')));
		}
	};

	return (
		<ReactPlayer
			url={`http://localhost:8080/api/stream/${movie.imdb}`}
			width="100%"
			height="auto"
			controls
			muted
			config={{
				file: {
					tracks: getSubtitles,
				},
			}}
			onProgress={({ played }) => checkWatched(played)}
		/>
	);
};

export default observer(MoviePlayer);
