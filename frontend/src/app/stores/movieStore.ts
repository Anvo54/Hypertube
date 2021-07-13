import { makeAutoObservable, runInAction } from 'mobx';
import agent from '../services/agent';
import { RootStore } from './rootStore';
import { IMovie, IMovieList } from '../models/movie';

export default class MovieStore {
	rootStore: RootStore;
	movies: IMovieList = { count: 0, movies: [] };
	movieQueryLength = 0;
	savedSearch = '';
	page = 1;
	prevGenre = '&genre=';
	limitValues = [
		{ key: 0, text: '20', value: 20 },
		{ key: 1, text: '40', value: 40 },
		{ key: 2, text: '60', value: 60 },
		{ key: 3, text: '80', value: 80 },
		{ key: 4, text: '100', value: 100 },
	];
	genresObj = [
		{key: 'Action', text: 'Action', value: 'Action'},
		{key: 'Comedy', text: 'Comedy', value: 'Comedy'},
		{key: 'Drama', text: 'Drama', value: 'Drama'},
		{key: 'Fantasy', text: 'Fantasy', value: 'Fantasy'},
		{key: 'Horror', text: 'Horror', value: 'Horror'},
		{key: 'Mystery', text: 'Mystery', value: 'Mystery'},
		{key: 'Romance', text: 'Romance', value: 'Romance'},
		{key: 'Thriller', text: 'Thriller', value: 'Thriller'},
		{key: 'Western', text: 'Western', value: 'Western'},
	];
	genre = '&genre=';
	limit = 20;
	orderBy = [
		{ key: 0, test: 'Ascending', value: 'asc' },
		{ key: 0, test: 'Descending', value: 'desc' },
	];
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
					this.genre,
				);
				runInAction(() => {
					if ((this.savedSearch !== search) || (this.genre != this.prevGenre)) {
						this.movieQueryLength = tempMovies.movies.length;
						this.movies.movies = tempMovies.movies;
						this.movies.count = tempMovies.movies.length;
						this.savedSearch = search;
						this.page = 0;
					} else {
						this.movieQueryLength = tempMovies.movies.length;
						this.movies.movies = [...this.movies.movies, ...tempMovies.movies]
						this.movies.count += tempMovies.movies.length;
					}
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

	getNextPage = (): void => {
		runInAction(() => (this.page += 1));
	};

	setResultLimit = (value: number): void => {
		runInAction(() => (this.limit = value));
	};

	setGenre = (genre: string[]): void => {
		runInAction(() => {
			this.genre = '&genre=' + genre.toLocaleString().replaceAll(',', '&genre=')
			this.getMovies(this.savedSearch);
		})
		this.prevGenre = this.genre;
	}
}
