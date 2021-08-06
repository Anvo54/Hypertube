import cronScheduler from 'cron';
import MovieModel, { IMovieDocument } from 'models/movie';
import { IUserDocument } from 'models/user';
import Fs from 'fs';
import Path from 'path';
import { torrentEngine } from 'app';
import { Response } from 'express';
import { startMovieDownload } from './torrent';
import { downloadSubtitles } from './subtitles';
import { SetupError } from './torrentEngine/setup';
import Debug from 'debug';

const debug = Debug('torrent');

const getMovieDocument = async (imdbCode: string): Promise<IMovieDocument> => {
	let movieDocument = await MovieModel.findOne({
		imdbCode: imdbCode,
	});
	if (!movieDocument) {
		movieDocument = new MovieModel({
			imdbCode: imdbCode,
			status: 0,
		});
	}

	movieDocument.lastViewed = Date.now();
	cronScheduler.addCronJob(movieDocument);

	const videoPath = Path.resolve(
		__dirname,
		`../../movies/${movieDocument.imdbCode}/${movieDocument.fileName}`
	);
	switch (movieDocument.status) {
		case 3:
			if (
				!torrentEngine.setups.get(movieDocument.imdbCode) &&
				!torrentEngine.instances.get(movieDocument.torrentHash)
			) {
				movieDocument.status = 0;
			} else if (
				!torrentEngine.setups.get(movieDocument.imdbCode) &&
				torrentEngine.instances.get(movieDocument.torrentHash)
			) {
				movieDocument.status = 1;
			}
			break;
		case 2:
			if (!Fs.existsSync(videoPath)) {
				movieDocument.status = 0;
			}
			break;
		case 1:
			if (!torrentEngine.instances.get(movieDocument.torrentHash)) {
				movieDocument.status = 0;
			}
	}
	await movieDocument.save();
	return movieDocument;
};

const startDownload = (
	movieDocument: IMovieDocument,
	user: IUserDocument,
	res: Response
): Promise<void> => {
	return new Promise(async (resolve, reject) => {
		try {
			movieDocument.status = 3;
			await movieDocument.save();
		} catch (error) {
			return reject(error);
		}
		const torrentSetup = torrentEngine.setup(movieDocument.imdbCode);
		torrentSetup.on('task', (task: string) => {
			res.write(`data: { "kind": "${task}", "status": "done" }\n\n`);
		});

		torrentSetup.once('error', async (error: SetupError) => {
			if (torrentSetup.instance) {
				torrentEngine.close(torrentSetup.torrent!.hash);
			}
			torrentSetup.removeAllListeners();
			torrentEngine.setups.delete(movieDocument.imdbCode);
			try {
				movieDocument.status = 0;
				await movieDocument.save();
				reject(error);
			} catch (err) {
				debug(err);
				reject(error);
			}
		});

		torrentSetup.once('movieHash', async (movieHash: string) => {
			try {
				movieDocument.movieHash = movieHash;
				const subtitles = await downloadSubtitles(movieDocument, user);
				res.write(
					`data: { "kind": "subtitles", "status": "done", "subtitles": ${JSON.stringify(
						subtitles
					)} }\n\n`
				);
			} catch (error) {
				debug(error);
				res.write(`data: { "kind": "subtitles", "status": "error" }\n\n`);
			}
		});

		torrentSetup.once('ready', async () => {
			torrentSetup.removeAllListeners();
			torrentEngine.setups.delete(movieDocument.imdbCode);
			try {
				const movie = await MovieModel.findOne({
					imdbCode: movieDocument.imdbCode,
				});
				const instance = torrentEngine.instances.get(
					torrentSetup.torrent?.hash ?? ''
				);
				if (movie && instance) {
					movie.status = 1;
					movie.torrentHash = torrentSetup.torrent!.hash;
					movie.fileName = instance.metadata.file.name;
					if (!movie.movieHash && torrentSetup.movieHash) {
						movie.movieHash = torrentSetup.movieHash;
					}
					instance.on('piece', (index: number) => {
						debug(`Downloaded piece ${index} for ${movie.imdbCode}`);
					});
					await movie.save();
				}
				resolve();
			} catch (error) {
				debug(error);
				reject(error);
			}
		});

		torrentSetup.setup();
	});
};

export const prepare = async (
	imdbCode: string,
	user: IUserDocument,
	res: Response
): Promise<void> => {
	let movieDocument: IMovieDocument | undefined;
	try {
		movieDocument = await getMovieDocument(imdbCode);
	} catch (error) {
		debug(error);
		throw new Error('generic_prepare_error');
	}

	if (movieDocument.status === 2 || movieDocument.status === 1) {
		res.write('data: { "kind": "mode", "status": "server" }\n\n');
	} else {
		res.write('data: { "kind": "mode", "status": "torrent" }\n\n');
	}

	switch (movieDocument.status) {
		case 0:
			await startDownload(movieDocument, user, res);
			break;
		default:
			try {
				const subtitles = await downloadSubtitles(movieDocument, user);
				res.write(
					`data: { "kind": "subtitles", "status": "done", "subtitles": ${JSON.stringify(
						subtitles
					)}}\n\n`
				);
			} catch (error) {
				res.write(`data: { "kind": "subtitles", "status": "error" }\n\n`);
			}
	}
};
