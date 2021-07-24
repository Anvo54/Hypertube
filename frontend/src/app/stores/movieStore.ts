import { makeAutoObservable, runInAction } from 'mobx';
import agent from '../services/agent';
import { RootStore } from './rootStore';
import { IMovie, IMovieList } from '../models/movie';
import _ from 'lodash';

export default class MovieStore {
	rootStore: RootStore;
	movies: IMovieList = { count: 0, movies: [] };
	movieQueryLength = 0;
	savedSearch = '';
	page = 0;
	startYear = new Date() || null;
	endYear = new Date() || null;
	minYear = '';
	maxYear = '';
	genre = '';
	rating = '';
	limitValues = [
		{ key: 0, text: '20', value: 20 },
		{ key: 1, text: '40', value: 40 },
		{ key: 2, text: '60', value: 60 },
		{ key: 3, text: '80', value: 80 },
		{ key: 4, text: '100', value: 100 },
	];
	limit = 20;
	orderVal = '&sort=title';
	order = 'asc';
	movie: IMovie | null = null;
	
	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
	}

	getMovies = (search: string): Promise<void> => {
		return new Promise(async (resolve) => {
			const token = await this.rootStore.userStore.getToken();
			try {
				const tempMovies: IMovieList = await agent.Movies.search(
					search,
					token,
					this.limit,
					this.page,
					this.order,
					this.genre,
					this.orderVal,
					this.rating,
					this.minYear,
					this.maxYear
				);
				runInAction(() => {
					this.movieQueryLength = tempMovies.movies.length;
					this.movies.movies = tempMovies.movies;
					this.movies.count = tempMovies.movies.length;
					this.savedSearch = search;
					this.page = 0;
				});
			} catch (error) {
				if (error.logUserOut) return this.rootStore.userStore.logoutUser();
				console.log(error);
			}
			resolve();
		});
	};

	getMovie = async (id: string): Promise<void> => {
		const token = await this.rootStore.userStore.getToken();
		try {
			const movie = await agent.Movies.get(id, token);
			runInAction(() => {
				this.movie = movie;
			});
		} catch (error) {
			if (error.logUserOut) return this.rootStore.userStore.logoutUser();
			console.log(error);
		}
	};

	addMovies = (search: string): Promise<void> => {
		return new Promise(async (resolve) => {
			const token = await this.rootStore.userStore.getToken();
			try {
				const tempMovies: IMovieList = await agent.Movies.search(
					search,
					token,
					this.limit,
					this.page,
					this.order,
					this.genre,
					this.orderVal,
					this.rating,
					this.minYear,
					this.maxYear
				);
				runInAction(() => {
					this.movieQueryLength = tempMovies.movies.length;
					this.movies.movies = _.uniqBy(
						[...this.movies.movies, ...tempMovies.movies],
						'imdb'
					);
					this.movies.count += tempMovies.movies.length;
				});
			} catch (error) {
				if (error.logUserOut) return this.rootStore.userStore.logoutUser();
				console.log(error);
			}
			resolve();
		});
	};

	getNextPage = (): void => {
		runInAction(() => (this.page += 1));
	};

	setResultLimit = (value: number): void => {
		runInAction(() => (this.limit = value));
	};

	setRatingFilter = (value: number): void => {
		runInAction(() => {
			this.rating = value > 0 ? '&rating=' + value : '';
			this.getMovies(this.savedSearch);
		});
	};

	setOrder = (value: string): void => {
		runInAction(() => {
			this.order = value ? '&order=' + value : '';
			this.getMovies(this.savedSearch);
		});
	};

	setOrderValue = (value: string): void => {
		runInAction(() => {
			this.orderVal = value === 'none' ? '' : '&sort=' + value;
			this.getMovies(this.savedSearch);
		});
	};

	setStartYear = (value: Date): void => {
		runInAction(() => {
			this.startYear = value;
			this.minYear = value === null ? '' : '&minYear=' + value.getFullYear();
			this.getMovies(this.savedSearch);
		});
	};

	setEndYear = (value: Date): void => {
		runInAction(() => {
			this.endYear = value;
			this.maxYear = value === null ? '' : '&maxYear=' + value.getFullYear();
		});
		this.getMovies(this.savedSearch);
	};

	setGenre = (genre: string): void => {
		runInAction(() => {
			this.genre = genre === 'none' ? '' : '&genre=' + genre;
			this.getMovies(this.savedSearch);
		});
	};
}
