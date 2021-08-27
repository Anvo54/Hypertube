import { TorrentDiscovery } from 'application/torrentEngine/discovery';
import { EventEmitter } from 'stream';
import ParseTorrentFile from 'parse-torrent-file';
import { IMetadata, TorrentInstance } from 'application/torrentEngine/instance';
import Debug from 'debug';
import Path from 'path';
import { TorrentSetup } from './setup';
import { SetupError } from './setupError';

interface IOptions {
	path: string;
	supportedTypes: string[];
}

export class TorrentEngine extends EventEmitter {
	options: IOptions;
	instances = new Map<string, TorrentInstance>();
	setups = new Map<string, TorrentSetup>();
	intervals = new Map<string, NodeJS.Timeout>();
	enabled = false;
	debug = Debug('engine');

	constructor(options: IOptions) {
		super();
		this.options = options;
	}

	add = (infoHash: string, imdbCode: string): Promise<TorrentInstance> =>
		new Promise<TorrentInstance>((resolve, reject) => {
			const discovery = new TorrentDiscovery(infoHash);
			const discoveryTimeout = setTimeout(() => {
				discovery.destroy();
				return reject(new SetupError('torrent_no_metadata', 'metadata'));
			}, 60000);

			discovery.once('metadata', (metadata: ParseTorrentFile.Instance) => {
				this.debug('Received metadata');
				clearTimeout(discoveryTimeout);
				const torrentMetadata = this.validateMetadata(metadata);
				if (!torrentMetadata) {
					discovery.destroy();
					return reject(new SetupError('torrent_invalid_metadata', 'metadata'));
				}
				const instance = new TorrentInstance(
					discovery,
					torrentMetadata,
					this,
					Path.resolve(this.options.path, imdbCode)
				);
				this.instances.set(infoHash, instance);
				instance.once('ready', () => {
					this.debug(`Instance ${imdbCode} ready`);
					resolve(instance);
					const interval = setInterval(() => instance.refresh(), 30000);
					this.intervals.set(infoHash, interval);
				});
			});
		});

	validateMetadata = (
		metadata: ParseTorrentFile.Instance
	): IMetadata | undefined => {
		let data: IMetadata | undefined;

		if (!metadata.files || !metadata.files.length) return;

		this.options.supportedTypes.forEach((type) => {
			metadata.files!.forEach((file) => {
				if (file.name.endsWith(type) && !data) {
					this.debug(`Selected movie file: ${file.name}`);
					data = {
						length: metadata.length!,
						pieces: metadata.pieces!,
						pieceLength: metadata.pieceLength!,
						lastPieceLength: metadata.lastPieceLength!,
						file: {
							name: file.name,
							offset: file.offset,
							length: file.length,
						},
					};
				}
			});
		});

		return data;
	};

	speed = (): number => {
		let speed = 0;
		this.instances.forEach((instance) => {
			instance.discovery.peers.forEach((peer) => {
				speed = speed + peer.wire.downloadSpeed();
			});
		});
		return Math.ceil(speed / 100000);
	};

	setup = (imdbCode: string): TorrentSetup => {
		const torrentSetup = new TorrentSetup(this, imdbCode);
		this.setups.set(imdbCode, torrentSetup);
		return torrentSetup;
	};

	close = (infoHash: string): void => {
		const instance = this.instances.get(infoHash);
		if (!instance) return;
		instance.discovery.destroy();
		instance.removeAllListeners();
		this.instances.delete(infoHash);
		const interval = this.intervals.get(infoHash);
		if (!interval) return;
		clearInterval(interval);
		this.intervals.delete(infoHash);
	};
}
