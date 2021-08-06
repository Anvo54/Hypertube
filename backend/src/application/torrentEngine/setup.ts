import { EventEmitter } from 'stream';
import Debug from 'debug';
import debug from 'debug';
import lodash from 'lodash';
import bayService from 'services/bay';
import ytsService from 'services/yts';
import { TorrentEngine } from './engine';
import { TorrentInstance } from './instance';

export class SetupError extends Error {
	task: string;
	constructor(message: string, task: string) {
		super(message);
		this.task = task;
		Object.setPrototypeOf(this, SetupError.prototype);
	}
}

interface ITorrent {
	hash: string;
	seeds: number;
	quality: string;
	type: string;
}

const findYtsTorrent = async (imdbCode: string): Promise<ITorrent[]> => {
	const ytsSearch = await ytsService.search(imdbCode);
	if (ytsSearch.status !== 'ok' || ytsSearch.data.movie_count !== 1) {
		throw new Error();
	}
	const ytsMovieDetails = await ytsService.details(ytsSearch.data.movies[0].id);
	const torrents = ytsMovieDetails.data.movie.torrents.filter(
		(t) => t.seeds !== 0
	);
	return torrents.map((t) => ({
		hash: t.hash,
		seeds: t.seeds,
		quality: t.quality,
		type: t.type,
	}));
};

const findBayTorrent = async (imdbCode: string): Promise<ITorrent[]> => {
	const bayMovieList = await bayService.search(imdbCode);
	const torrents = bayMovieList.filter((t) => t.seeders !== '0');

	return torrents.map((t) => {
		const torrent: ITorrent = {
			hash: t.info_hash,
			seeds: parseInt(t.seeders),
			quality: 'unknown',
			type: 'unknown',
		};
		if (/720p/.test(t.name)) {
			torrent.quality = '720p';
		}
		if (/1080p/.test(t.name)) {
			torrent.quality = '1080p';
		}
		if (/brrip/i.test(t.name)) {
			torrent.type = 'bluray';
		}
		if (/webrip/i.test(t.name)) {
			torrent.quality = 'web';
		}

		return torrent;
	});
};

const findTorrent = async (imdbCode: string): Promise<ITorrent> => {
	try {
		let torrents: ITorrent[] = [];

		const [ytsPromiseResult, bayPromiseResult] = await Promise.allSettled([
			findYtsTorrent(imdbCode),
			findBayTorrent(imdbCode),
		]);
		if (ytsPromiseResult.status === 'fulfilled' && ytsPromiseResult.value) {
			torrents = ytsPromiseResult.value;
		}
		if (bayPromiseResult.status === 'fulfilled' && bayPromiseResult.value) {
			torrents = [...torrents, ...bayPromiseResult.value];
		}
		if (!torrents.length) throw new Error('No torrents with seeders.');
		torrents = lodash.orderBy(torrents, ['seeds'], ['desc']);
		const mostSeeds = torrents[0];
		const br1 = torrents.find(
			(t) => t.quality === '720p' && t.type === 'bluray'
		);
		const br2 = torrents.find(
			(t) => t.quality === '1080p' && t.type === 'bluray'
		);
		if (br1 && (mostSeeds.seeds - br1.seeds) / br1.seeds < 0.65) return br1;
		if (br2 && (mostSeeds.seeds - br2.seeds) / br2.seeds < 0.65) return br2;
		return mostSeeds;
	} catch (error) {
		debug(error);
		throw new SetupError('torrent_no_seed', 'torrent');
	}
};

export class TorrentSetup extends EventEmitter {
	debug = Debug('setup');
	imdbCode: string;
	torrent: ITorrent | undefined;
	engine: TorrentEngine;
	instance: TorrentInstance | undefined;
	movieHash: string | undefined;

	constructor(engine: TorrentEngine, imdbCode: string) {
		super();
		this.engine = engine;
		this.imdbCode = imdbCode;
	}

	setup = async () => {
		try {
			if (!this.engine.enabled) {
				throw new SetupError('torrent_engine_disabled', 'torrent');
			}
			if (this.engine.instances.size + this.engine.setups.size > 5) {
				throw new SetupError('torrent_max_instances', 'torrent');
			}
			this.torrent = await findTorrent(this.imdbCode);
			if (this.engine.instances.get(this.torrent.hash)) {
				throw new SetupError('torrent_duplicate', 'torrent');
			}
			this.emit('task', 'torrent');
			this.instance = await this.engine.add(this.torrent.hash, this.imdbCode);
			this.emit('task', 'metadata');
			this.instance.once('moviehash', (movieHash: string) => {
				this.movieHash = movieHash;
				this.emit('movieHash', movieHash);
			});
			const checkReady = () => {
				if (!this.movieHash || !this.instance) return;
				for (
					let i = this.instance.file.startPiece;
					i < this.instance.file.startPiece + 9;
					i++
				) {
					if (!this.instance.bitfield.get(i)) return;
				}
				this.instance.removeListener('piece', checkReady);
				this.emit('task', 'firstPieces');
				this.emit('ready');
			};
			this.instance.on('piece', checkReady);
			this.instance.startDownload();
		} catch (error) {
			this.emit('error', error);
		}
	};
}
