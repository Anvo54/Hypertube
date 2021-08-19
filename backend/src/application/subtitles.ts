import osService, { IOSSubtitle } from 'services/openSubtitles';
import Path from 'path';
import Fs from 'fs';
import lodash from 'lodash';
import Debug from 'debug';
import MovieModel, { IMovieDocument } from 'models/movie';
import { AxiosAgent } from 'services/axiosAgent';
import { IUserDocument } from 'models/user';

const debug = Debug('subtitles');

const subtitleDir = Path.resolve(__dirname, '../../public/subtitles/');

const searchSubtitles = async (
	movieDocument: IMovieDocument,
	languages: string[]
) => {
	languages = languages.map((l) => (l === 'ee' ? 'et' : l));
	const subtitles = await osService.search(
		movieDocument.imdbCode,
		movieDocument.movieHash,
		languages
	);

	const subtitlesByLanguage = lodash.groupBy(
		subtitles.data,
		(d) => d.attributes.language
	);

	return subtitlesByLanguage;
};

const checkSubtitles = (movieDocument: IMovieDocument, languages: string[]) => {
	const subtitlesReady = movieDocument.subtitles.reduce(
		(list: string[], current) => {
			const path = Path.resolve(
				subtitleDir,
				`${movieDocument.imdbCode}/${current}.webvtt`
			);
			if (Fs.existsSync(path) && Fs.statSync(path).size > 1000) {
				return [...list, current];
			}
			movieDocument.subtitles = movieDocument.subtitles.filter(
				(s) => s !== current
			);
			return list;
		},
		[]
	);

	const subtitles = languages.reduce((list: string[], current) => {
		if (subtitlesReady.includes(current)) return list;
		return [...list, current];
	}, []);

	return subtitles;
};

const downloadSubtitleFile = async (
	subtitle: IOSSubtitle,
	imdbCode: string
): Promise<void> => {
	const language =
		subtitle.attributes.language === 'et' ? 'ee' : subtitle.attributes.language;
	const fileName = `${language}.webvtt`;
	const path = Path.resolve(subtitleDir, imdbCode, fileName);
	const downloadLink = await osService.downloadLink(
		subtitle.attributes.files[0].file_id,
		language
	);

	const writer = Fs.createWriteStream(path);
	const response = await new AxiosAgent(downloadLink.link).getStream();
	response.data.pipe(writer);
	return new Promise((resolve, reject) => {
		writer.on('finish', resolve);
		writer.on('error', reject);
	});
};

export const downloadSubtitles = async (
	imdbCode: string,
	user: IUserDocument
): Promise<string[]> => {
	let movieDocument = await MovieModel.findOne({ imdbCode });
	if (!movieDocument) throw new Error('no movie document in db');

	if (!Fs.existsSync(Path.resolve(subtitleDir, imdbCode))) {
		Fs.mkdirSync(Path.resolve(subtitleDir, imdbCode), {
			recursive: true,
		});
	}

	const languages = [user.language ?? 'en'];
	if (!languages.includes('en')) languages.push('en');
	const languagesToGet = checkSubtitles(movieDocument, languages);

	if (languagesToGet.length === 0) return languages;
	const subtitlesByLanguage = await searchSubtitles(
		movieDocument,
		languagesToGet
	);

	const promiseList = await Promise.allSettled(
		languagesToGet.map(async (language) => {
			if (language === 'ee') language = 'et';
			if (!subtitlesByLanguage[language])
				return Promise.reject(`No subtitles for language: ${language}`);
			let chosenSubtitle = subtitlesByLanguage[language].find(
				(s) =>
					s.attributes.files[0] &&
					!s.attributes.files[1] &&
					s.attributes.moviehash_match
			);
			if (!chosenSubtitle) {
				chosenSubtitle = subtitlesByLanguage[language].find(
					(s) => s.attributes.files[0] && !s.attributes.files[1]
				);
			}
			if (!chosenSubtitle)
				return Promise.reject(`No subtitles for language: ${language}`);
			try {
				await downloadSubtitleFile(chosenSubtitle, imdbCode);
				return language;
			} catch (error) {
				return Promise.reject(error);
			}
		})
	);

	movieDocument = await MovieModel.findOne({ imdbCode });
	if (!movieDocument) throw new Error('no movie document in db');

	promiseList.forEach((promise) => {
		if (promise.status === 'fulfilled' && promise.value) {
			const language = promise.value === 'et' ? 'ee' : promise.value;
			if (!movieDocument!.subtitles.includes(language)) {
				movieDocument!.subtitles.push(language);
			}
		} else {
			debug(promise);
		}
	});

	movieDocument.subtitles.sort();
	await movieDocument.save();
	return movieDocument.subtitles;
};
