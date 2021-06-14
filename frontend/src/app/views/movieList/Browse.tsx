import { IMovie } from 'app/models/movie';
import BrowseLoader from 'app/views/movieList/BrowseLoader';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
	Header,
	Item,
	Label,
	Rating,
	Segment,
	Visibility,
} from 'semantic-ui-react';

export interface BrowseProps {
	movies: IMovie[];
	loading: boolean;
	getNextPage: any;
	movieQueryLength: number;
}

const Browse: React.FC<BrowseProps> = ({
	movies,
	loading,
	getNextPage,
	movieQueryLength,
}) => {
	const { t } = useTranslation();

	const getNext = () => {
		if (movieQueryLength !== 0) {
			getNextPage();
		}
	};

	return (
		<Segment>
			{loading && <BrowseLoader />}
			{movies.length === 0 ? (
				<Header>{t('no_results')}</Header>
			) : (
				<Item.Group divided>
					{movies.map((movie) => (
						<Item key={movie.imdb} as={Link} to={`/movies/${movie.imdb}`}>
							<Item.Image src={movie.coverImage} />
							<Item.Content>
								<Item.Header>{movie.title}</Item.Header>
								<Item.Meta>
									<p>{movie.year}</p>
									<Rating
										size="tiny"
										icon="star"
										defaultRating={movie.rating}
										disabled
										maxRating={10}
									/>
								</Item.Meta>
								<Item.Description>
									{movie.genres &&
										movie.genres.map((genre) => (
											<Label key={genre}>{t(genre.toLowerCase())}</Label>
										))}
								</Item.Description>
							</Item.Content>
						</Item>
					))}
				</Item.Group>
			)}
			<Visibility onBottomVisible={() => getNext()} once={loading} />
		</Segment>
	);
};

export default observer(Browse);
