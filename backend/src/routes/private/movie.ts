import {
	commentMovie,
	getMovie,
	searchMovies,
	setWatched,
	streamMovie,
} from 'controllers/movie';
import { Router } from 'express';

const movieRouter = Router();

movieRouter.get('/search', searchMovies);
movieRouter.get('/:imdbCode/stream', streamMovie);
movieRouter.post('/:imdbCode/watch', setWatched);
movieRouter.post('/:imdbCode/comment', commentMovie);
movieRouter.get('/:imdbCode', getMovie);

export default movieRouter;
