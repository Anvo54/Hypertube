import { search } from 'application/library';
import asyncHandler from 'express-async-handler';
import {
	dummyThumbnail,
	IMovieThumbnail,
	IMovieThumbnailEnvelope,
} from 'models/movie';
import lodash, { isString, toLower } from 'lodash';
import { details } from 'application/movie';
import { Request } from 'express';
import MovieModel from 'models/movie';
import { BadRequest, Unauthorized } from 'http-errors';
import { movieStream } from 'application/stream';
import UserModel from 'models/user';
import ViewingModel from 'models/viewing';
import CommentModel, { IComment } from 'models/comment';
import { IAuthPayload } from '../../@types/express';
import { JsonWebTokenError, verify } from 'jsonwebtoken';
import { prepare } from 'application/prepare';
import { SetupError } from 'application/torrentEngine/setupError';

export interface IQueryParams {
	query: string;
	page: number;
	limit: number;
	sort: string;
	order: boolean | 'asc' | 'desc';
	genre?: string;
	rating?: number;
	minYear?: number;
	maxYear?: number;
}

const parseParams = (req: Request) => {
	const params: IQueryParams = {
		query: 'a', // Hard code 'a' => top movies.
		page: 1,
		limit: 20,
		sort: 'title',
		order: 'asc',
		genre: undefined,
		rating: undefined,
	};

	if (isString(req.query.query) && req.query.query.length > 1) {
		params.query = req.query.query;
	}
	if (isString(req.query.page) && parseInt(req.query.page) > 0) {
		params.page = parseInt(req.query.page);
	}
	if (isString(req.query.limit) && parseInt(req.query.limit) > 0) {
		params.limit = parseInt(req.query.limit);
	}
	if (isString(req.query.sort) && req.query.sort in dummyThumbnail) {
		params.sort = req.query.sort;
	}
	if (
		isString(req.query.order) &&
		(req.query.order === 'asc' || req.query.order === 'desc')
	) {
		params.order = req.query.order;
	}
	if (isString(req.query.genre)) {
		params.genre = req.query.genre;
	}
	if (isString(req.query.rating)) {
		params.rating = parseInt(req.query.rating);
	}
	if (isString(req.query.minYear)) {
		params.minYear = parseInt(req.query.minYear);
	}
	if (isString(req.query.maxYear)) {
		params.maxYear = parseInt(req.query.maxYear);
	}
	return params;
};

export const filterList = (
	list: IMovieThumbnail[],
	params: IQueryParams
): IMovieThumbnail[] => {
	if (params.genre) {
		list = list.filter((t) => t.genres.includes(params.genre!));
	}
	if (params.rating) {
		list = list.filter((t) => Math.floor(t.rating) >= params.rating!);
	}
	if (params.minYear) {
		list = list.filter((t) => t.year >= params.minYear!);
	}
	if (params.maxYear) {
		list = list.filter((t) => t.year <= params.maxYear!);
	}
	return list;
};

export const paginate = (
	list: IMovieThumbnail[],
	params: IQueryParams
): IMovieThumbnail[] => {
	list = lodash(list)
		.orderBy([params.sort, 'title'], [params.order, 'asc'])
		.drop((params.page - 1) * params.limit)
		.take(params.limit)
		.value();
	return list;
};

export const searchMovies = asyncHandler(async (req, res) => {
	const user = await UserModel.findById(req.authPayload?.userId);
	if (!user) throw new Unauthorized('not logged in');
	const params = parseParams(req);
	let thumbnailList = await search(params.query);

	// Get list of genres included in the result before filtering.
	const genres = lodash(thumbnailList)
		.flatMap((t) => t.genres)
		.sortBy()
		.sortedUniqBy(toLower)
		.value();

	thumbnailList = filterList(thumbnailList, params);
	// Get movie count before paginating.
	const count = thumbnailList.length;
	thumbnailList = paginate(thumbnailList, params);

	const viewings = await ViewingModel.find({ user: user._id }).populate(
		'movie',
		'imdbCode'
	);
	let viewingsLength = viewings.length;

	if (viewings.length) {
		thumbnailList = thumbnailList.map((t) => {
			if (
				viewingsLength &&
				viewings.find(
					(v) => 'imdbCode' in v.movie && v.movie.imdbCode === t.imdb
				)
			) {
				viewingsLength -= 1;
				return { ...t, watched: true };
			}
			return t;
		});
	}

	const envelope: IMovieThumbnailEnvelope = {
		count,
		genres,
		movies: thumbnailList,
	};
	res.json(envelope);
});

export const getMovie = asyncHandler(async (req, res) => {
	const user = await UserModel.findById(req.authPayload?.userId);
	if (!user) throw new Unauthorized('not logged in');
	const imdbCode = req.params.imdbCode;
	const movie = await details(imdbCode);
	const movieDocument = await MovieModel.findOne({ imdbCode });
	if (movieDocument) {
		const commentDocuments = await CommentModel.find({
			movie: movieDocument._id,
		});
		const promises = await Promise.allSettled(
			commentDocuments.map(async (c) => {
				return await c.toDto();
			})
		);
		const comments: IComment[] = [];
		promises.forEach((p) => {
			if (p.status === 'fulfilled' && p.value) {
				comments.push(p.value);
			}
		});
		movie.comments = comments.sort((a, b) => a.timestamp - b.timestamp);
		const viewing = await ViewingModel.findOne({
			user: user._id,
			movie: movieDocument._id,
		});
		movie.watched = !!viewing;
	}
	res.json(movie);
});

export const prepareMovie = asyncHandler(async (req, res) => {
	// Send SSE headers.
	const headers = {
		'Content-Type': 'text/event-stream',
		Connection: 'keep-alive',
		'Cache-Control': 'no-cache',
	};
	res.writeHead(200, headers);
	const interval = setInterval(() => {
		res.write('data: { "kind": "keepalive" }\n\n');
	}, 30000);

	// Check JWT Token.
	try {
		const { authorization } = req.headers;
		if (!authorization) throw new JsonWebTokenError('Token is missing.');
		const token = authorization.split(' ')[1];
		const payload = verify(
			token,
			process.env.ACCESS_TOKEN_SECRET!
		) as IAuthPayload;
		const user = await UserModel.findById(payload.userId);
		if (!user) throw new Unauthorized('User not found.');

		// Setup torrent and download subtitles
		await prepare(req.params.imdbCode, user, res);
		res.write('data: { "kind": "ready" }\n\n');
	} catch (error) {
		if (error instanceof JsonWebTokenError || error instanceof Unauthorized) {
			res.write('data: { "kind": "error", "type": "logout" }\n\n');
		} else {
			if (error instanceof SetupError) {
				res.write(`data: { "kind": "${error.task}", "status": "error" }\n\n`);
			}
			res.write(
				`data: { "kind": "error", "type": "generic", "message": "${error.message}" }\n\n`
			);
		}
	}
	clearInterval(interval);
	res.end();
});

export const streamMovie = asyncHandler(async (req, res) => {
	const cookie = req.cookies.isLoggedIn;
	if (!cookie || cookie !== 'true') {
		throw new Unauthorized('not logged in');
	}
	const movieDocument = await MovieModel.findOne({
		imdbCode: req.params.imdbCode,
	});
	if (!movieDocument) throw new BadRequest('Movie not found in database');
	movieStream(req, res, movieDocument);
});

export const setWatched = asyncHandler(async (req, res) => {
	const user = await UserModel.findById(req.authPayload?.userId);
	if (!user) throw new Unauthorized('not logged in');
	const movie = await MovieModel.findOne({
		imdbCode: req.params.imdbCode,
	});
	if (!movie) throw new BadRequest('not such movie');

	let viewing = await ViewingModel.findOne({
		user: user._id,
		movie: movie._id,
	});
	if (!viewing) {
		viewing = new ViewingModel({
			user: user._id,
			movie: movie._id,
		});
		await viewing.save();
	}
	res.send('OK');
});

export const commentMovie = asyncHandler(async (req, res) => {
	const user = await UserModel.findById(req.authPayload?.userId);
	if (!user) throw new Unauthorized('not logged in');
	let movie = await MovieModel.findOne({
		imdbCode: req.params.imdbCode,
	});
	if (!movie) {
		movie = new MovieModel({
			imdbCode: req.params.imdbCode,
			status: 0,
		});
		await movie.save();
	}
	const commentText = req.body.comment;
	if (
		!isString(commentText) ||
		commentText.length < 2 ||
		commentText.length > 500 ||
		/^\s+$/.test(commentText)
	) {
		throw new BadRequest('invalid comment');
	}
	const comment = new CommentModel({
		user: user._id,
		movie: movie._id,
		timestamp: Date.now(),
		text: commentText,
	});

	await comment.save();
	res.json(await comment.toDto());
});
