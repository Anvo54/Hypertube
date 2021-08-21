import React from 'react';
import MovieLoader from 'app/views/movieDetails/MovieLoader';
import { RootStoreContext } from 'app/stores/rootStore';
import { observer } from 'mobx-react-lite';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
	Grid,
	GridColumn,
	Item,
	ItemExtra,
	Rating,
	Segment,
	Header,
	Label,
	Loader,
	Dimmer,
	Image,
	Icon,
} from 'semantic-ui-react';
import { IActorObj } from 'app/models/movie';
import { useTranslation } from 'react-i18next';
import Comments from './Comments';
import UsersProfileModal from './UsersProfileModal';
import MoviePlayer from './MoviePlayer';
import ErrorMessage from 'app/sharedComponents/form/ErrorMessage';
import PrepareModal from './PrepareModal';
import { toast } from 'react-toastify';

interface IParams {
	id: string;
}

const Movie = () => {
	const { t } = useTranslation();
	const { id } = useParams<IParams>();
	const rootStore = useContext(RootStoreContext);
	const [loading, setLoading] = useState(true);
	const [playerLoader, setPlayerLoader] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [error, setError] = useState('');
	const [movieReady, setMovieReady] = useState(false);
	const [modalUsername, setModalUsername] = useState('');
	const { movie, getMovie, prepareMovie, createComment } = rootStore.movieStore;

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	useEffect(() => {
		getMovie(id)
			.catch((err) => setError(err.message))
			.finally(() => setLoading(false));
	}, [getMovie, id]);

	const startPlay = () => {
		setPlayerLoader(true);
		prepareMovie()
			.then(() => setMovieReady(true))
			.catch((error) => {
				if (error && error.message) toast.error(t(error.message));
			})
			.finally(() => setPlayerLoader(false));
	};

	const openModal = (username: string): void => {
		setModalUsername(username);
		setShowModal(true);
	};

	if (loading) return <MovieLoader />;
	if (error)
		return <ErrorMessage style={{ marginTop: 80 }} message={t(error)} />;

	const headerStyles: any = {};
	if (movie && movie.watched) headerStyles.marginBottom = '5px';

	return (
		movie && (
			<Segment style={{ marginTop: 80, paddingBottom: 40 }}>
				<Grid>
					<Grid.Row columns="1">
						<GridColumn>
							<Header as="h1" style={headerStyles}>
								{movie.title}
							</Header>

							{movie.watched && (
								<Header
									sub
									style={{ color: 'teal', fontSize: '1.1rem', marginTop: 0 }}
								>
									<Icon name="eye" />
									{t('watched')}
								</Header>
							)}
							{!movieReady && (
								<Dimmer.Dimmable
									dimmed={playerLoader}
									style={{
										backgroundImage: `url(${movie.coverImage})`,
										backgroundSize: 'cover',
										backgroundPosition: 'right 0px bottom 0px',
										cursor: 'pointer',
									}}
								>
									<Dimmer active={playerLoader} inverted>
										<Loader>
											{t('movie_loading')} {movie.title}
										</Loader>
									</Dimmer>
									<Image src="/background.png" onClick={() => startPlay()} />
								</Dimmer.Dimmable>
							)}
							{!playerLoader && movieReady && <MoviePlayer />}
						</GridColumn>
						<Grid.Column style={{ marginTop: '10px' }}>
							<Item.Content>
								<Rating
									icon="star"
									disabled
									maxRating={10}
									rating={movie.rating}
								/>
								<Item.Meta style={{ fontWeight: 600, marginBottom: 10 }}>
									{movie.summary}
								</Item.Meta>
								<ItemExtra>
									{t('directed')} {movie.director}
								</ItemExtra>
								<ItemExtra>{t('runtime', { time: movie.runtime })}</ItemExtra>
								<Item.Content>
									{t('year')} {movie.year}
								</Item.Content>
								<ItemExtra>
									{t('written')} {movie.writer}
								</ItemExtra>
								{typeof movie.actors !== 'undefined' && (
									<Header as="h5">{t('actors')}</Header>
								)}
								{typeof movie.actors === 'string' && <div>{movie.actors}</div>}
								{typeof movie.actors === 'object' &&
									movie.actors.map((actor: IActorObj) => (
										<Label
											image
											key={actor.imdb_code}
											as="a"
											href={`https://www.imdb.com/name/nm${actor.imdb_code}`}
											style={{ marginRight: 5, marginTop: 5 }}
											target="_blank"
											rel="noreferrer noopener"
										>
											<img
												src={actor.url_small_image || '/NoImage.png'}
												alt={actor.name}
											/>
											{` ${actor.name} `}
										</Label>
									))}
							</Item.Content>
						</Grid.Column>
					</Grid.Row>
				</Grid>
				<Comments
					comments={movie.comments}
					createComment={createComment}
					showModal={openModal}
				/>
				<UsersProfileModal
					show={showModal}
					username={modalUsername}
					setShow={setShowModal}
				/>
				<PrepareModal movieReady={movieReady} />
			</Segment>
		)
	);
};

export default observer(Movie);
