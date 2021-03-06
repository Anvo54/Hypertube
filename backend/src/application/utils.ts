import { IMovieThumbnail } from 'models/movie';
import { IOmdbMovieDetails } from 'services/omdb';
import { IYtsMovie } from 'services/yts';

export const ytsMovieToMovieThumbnail = (
	ytsMovie?: IYtsMovie
): IMovieThumbnail | undefined => {
	if (
		ytsMovie &&
		ytsMovie.title_english.length > 0 &&
		ytsMovie.imdb_code.length > 0 &&
		ytsMovie.rating > 0
	) {
		return {
			title: ytsMovie.title_english,
			year: ytsMovie.year,
			coverImage: ytsMovie.medium_cover_image,
			genres: ytsMovie.genres,
			rating: ytsMovie.rating,
			imdb: ytsMovie.imdb_code,
			watched: false,
		} as IMovieThumbnail;
	}
};

export const omdbDetailsToMovieThumbnail = (
	omdbDetails?: IOmdbMovieDetails
): IMovieThumbnail | undefined => {
	if (
		omdbDetails &&
		omdbDetails.Title.length > 0 &&
		parseFloat(omdbDetails.imdbRating) > 0
	) {
		return {
			title: omdbDetails.Title,
			year: parseInt(omdbDetails.Year),
			coverImage: omdbDetails.Poster,
			genres: omdbDetails.Genre.split(',').map((g) => g.trim()),
			rating: parseFloat(omdbDetails.imdbRating),
			imdb: omdbDetails.imdbID,
			watched: false,
		} as IMovieThumbnail;
	}
};
