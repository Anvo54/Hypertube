import { makeAutoObservable, runInAction } from 'mobx';
import agent from '../services/agent';
import { RootStore } from './rootStore';
import { IMovie, IMovieList } from '../models/movie';
import _ from 'lodash';
import { EventSourcePolyfill } from 'event-source-polyfill';

export type PrepareTaskStatus =
	| 'disabled'
	| 'waiting'
	| 'loading'
	| 'done'
	| 'error';

export interface IPrepareTasks {
	torrent: PrepareTaskStatus;
	metadata: PrepareTaskStatus;
	subtitles: PrepareTaskStatus;
	firstPieces: PrepareTaskStatus;
}

export default class MovieStore {
	rootStore: RootStore;
	movies: IMovieList = { count: 0, movies: [] };
	count = 0;
	savedSearch = '';
	page = 1;
	startYear: Date | null;
	endYear: Date | null;
	genre = '';
	ratingVal = 0;
	orderVal = 'title';
	order = 'asc';
	loading = false;
	params = new URLSearchParams();
	movie: IMovie | null = null;
	subtitles: string[] = [];
	prepareMode: 'torrent' | 'server' | null = null;
	prepareTasks: IPrepareTasks;
	prepareModalOpen = false;
	prepareError?: string;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		this.startYear = null;
		this.endYear = null;
		this.prepareTasks = {
			torrent: 'waiting',
			metadata: 'waiting',
			subtitles: 'waiting',
			firstPieces: 'waiting',
		};
		makeAutoObservable(this);
	}

	get searchParams(): URLSearchParams {
		return this.params;
	}

	get totalPages(): number {
		return Math.ceil(this.count / 20);
	}

	getMovies = (): Promise<void> => {
		return new Promise(async (resolve, reject) => {
			runInAction(() => {
				this.loading = true;
				this.page = 1;
				if (this.params.has('page')) {
					this.params.set('page', String(this.page));
				}
			});
			try {
				const token = await this.rootStore.userStore.getToken();
				const tempMovies: IMovieList = await agent.Movies.search(
					this.searchParams,
					token
				);
				runInAction(() => {
					this.count = tempMovies.count;
					this.movies.movies = tempMovies.movies;
					this.loading = false;
				});
			} catch (error) {
				reject();
			}
			resolve();
		});
	};

	getMovie = async (id: string): Promise<void> => {
		runInAction(() => (this.loading = true));
		try {
			const token = await this.rootStore.userStore.getToken();
			const movie = await agent.Movies.get(id, token);
			runInAction(() => {
				this.movie = movie;
				this.loading = false;
			});
		} catch (error) {
			throw error;
		}
	};

	addMovies = (): Promise<void> => {
		return new Promise(async (resolve, reject) => {
			runInAction(() => (this.loading = true));
			try {
				const token = await this.rootStore.userStore.getToken();
				const tempMovies: IMovieList = await agent.Movies.search(
					this.searchParams,
					token
				);
				runInAction(() => {
					this.movies.movies = _.uniqBy(
						[...this.movies.movies, ...tempMovies.movies],
						'imdb'
					);
					this.loading = false;
				});
			} catch (error) {
				reject();
			}
			resolve();
		});
	};

	getNextPage = (value: number): Promise<void> => {
		return new Promise((resolve, reject) => {
			runInAction(() => {
				this.page = value;
				if (this.params.has('page')) {
					this.params.set('page', String(this.page));
				} else {
					this.params.append('page', String(this.page));
				}
				return this.addMovies().catch(() => reject());
			});
		});
	};

	setRatingFilter = (value: number): Promise<void> => {
		return new Promise((resolve, reject) => {
			runInAction(() => {
				this.ratingVal = value;
				if (this.params.has('rating')) {
					this.params.set('rating', String(value));
				} else {
					this.params.append('rating', String(value));
				}
				return this.getMovies().catch(() => reject());
			});
		});
	};

	setOrder = (value: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			runInAction(() => {
				if (this.params.has('order')) {
					this.params.set('order', value);
				} else {
					this.params.append('order', value);
				}
				this.getMovies().catch(() => reject());
			});
		});
	};

	setOrderValue = (value: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			runInAction(() => {
				if (this.params.has('sort')) {
					value === 'none'
						? this.params.delete('sort')
						: this.params.set('sort', value);
				} else {
					value === 'none'
						? this.params.delete('sort')
						: this.params.append('sort', value);
				}
				this.orderVal = value === 'none' ? '' : value;
				this.getMovies().catch(() => reject());
			});
		});
	};

	setStartYear = (value: Date): Promise<void> => {
		return new Promise((resolve, reject) => {
			runInAction(() => {
				this.startYear = value;
				if (this.params.has('minYear')) {
					value === null
						? this.params.delete('minYear')
						: this.params.set('minYear', value.getFullYear().toString());
				} else {
					this.params.append('minYear', value.getFullYear().toString());
				}
				this.getMovies().catch(() => reject());
			});
		});
	};

	setEndYear = (value: Date): Promise<void> => {
		return new Promise((resolve, reject) => {
			runInAction(() => {
				this.endYear = value;
				if (this.params.has('maxYear')) {
					value === null
						? this.params.delete('maxYear')
						: this.params.set('maxYear', value.getFullYear().toString());
				} else {
					this.params.append('maxYear', value.getFullYear().toString());
				}
				this.getMovies().catch(() => reject());
			});
		});
	};

	setSearchQuery = (query: string): void => {
		this.savedSearch = query;
		runInAction(() => {
			if (this.params.has('query')) {
				this.params.set('query', query);
			} else {
				this.params.append('query', query);
			}
		});
	};

	setGenre = (genre: string): Promise<void> => {
		return new Promise((resolve, reject) => {
			runInAction(() => {
				this.genre = genre;
				if (this.params.has('genre')) {
					genre === 'none'
						? this.params.delete('genre')
						: this.params.set('genre', genre);
				} else {
					genre === 'none'
						? this.params.delete('genre')
						: this.params.append('genre', genre);
				}
				this.getMovies().catch(() => reject());
			});
		});
	};

	prepareMovie = async (): Promise<void> => {
		return new Promise(async (resolve, reject) => {
			if (!this.movie) return reject();
			const token = await this.rootStore.userStore.getToken();
			runInAction(() => (this.prepareModalOpen = true));
			const sse = new EventSourcePolyfill(
				`http://localhost:8080/api/movies/${this.movie.imdb}/prepare`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			sse.onerror = () => {
				runInAction(() => (this.prepareError = 'error'));
				sse.close();
				reject(new Error('error'));
			};
			sse.onmessage = (event: any) => {
				runInAction(() => {
					const message = JSON.parse(event.data);
					switch (message.kind) {
						case 'mode':
							if (message.status === 'server') {
								this.prepareMode = 'server';
								this.prepareTasks = {
									torrent: 'disabled',
									metadata: 'disabled',
									subtitles: 'waiting',
									firstPieces: 'disabled',
								};
							} else {
								this.prepareMode = 'torrent';
								this.prepareTasks = {
									torrent: 'loading',
									metadata: 'waiting',
									subtitles: 'waiting',
									firstPieces: 'waiting',
								};
							}
							break;
						case 'torrent':
							this.prepareTasks.torrent = message.status;
							if (this.prepareTasks.torrent === 'done') {
								this.prepareTasks.metadata = 'loading';
							}
							break;
						case 'metadata':
							this.prepareTasks.metadata = message.status;
							if (this.prepareTasks.metadata === 'done') {
								this.prepareTasks.subtitles = 'loading';
								this.prepareTasks.firstPieces = 'loading';
							}
							break;
						case 'subtitles':
							this.prepareTasks.subtitles = message.status;
							if (this.prepareTasks.subtitles === 'done') {
								this.subtitles = message.subtitles;
							}
							if (this.prepareTasks.firstPieces === 'waiting') {
								this.prepareTasks.firstPieces = 'loading';
							}
							break;
						case 'firstPieces':
							this.prepareTasks.firstPieces = message.status;
							break;
						case 'ready':
							if (!this.prepareModalOpen) this.closePrepareModal();
							sse.close();
							resolve();
							break;
						case 'error':
							if (message.type === 'logout') {
								return this.rootStore.userStore.logoutUser();
							} else {
								this.prepareError = message.message ?? 'error';
							}
							sse.close();
							reject(message.message);
					}
				});
			};
		});
	};

	closePrepareModal = (): void => {
		this.prepareModalOpen = false;
		this.prepareMode = null;
		this.prepareTasks = {
			torrent: 'waiting',
			metadata: 'waiting',
			subtitles: 'waiting',
			firstPieces: 'waiting',
		};
		this.prepareError = undefined;
	};

	setLoading = (value: boolean): void => {
		runInAction(() => {
			this.loading = value;
		});
	};

	get getSubtitles(): any[] {
		if (!this.movie) return [];
		return this.subtitles.map((s) => {
			return {
				kind: 'subtitles',
				src: `http://localhost:8080/subtitles/${this.movie!.imdb}/${s}.webvtt`,
				srcLang: s,
				default: s === 'en',
			};
		});
	}

	setWatched = async (): Promise<void> => {
		if (!this.movie) return;
		this.movie.watched = true;
		try {
			const token = await this.rootStore.userStore.getToken();
			await agent.Movies.setWatched(this.movie.imdb, token);
		} catch (error) {
			throw error;
		}
	};

	createComment = async (comment: string): Promise<void> => {
		if (!this.movie) {
			return;
		}
		try {
			const token = await this.rootStore.userStore.getToken();
			const newComment = await agent.Movies.comment(
				this.movie.imdb,
				comment,
				token
			);
			runInAction(() => {
				if (this.movie) {
					this.movie.comments.push(newComment);
				}
			});
		} catch (error) {
			throw error;
		}
	};
}
