import { IMovie } from 'app/models/movie';
import BrowseLoader from 'app/views/movieList/BrowseLoader';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
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
	totalPages: number;
	page: number;
}

const Browse: React.FC<BrowseProps> = ({
	movies,
	loading,
	getNextPage,
	totalPages,
	page,
}) => {
	const { t } = useTranslation();
	const getNext = () => {
		if (totalPages !== page) {
			getNextPage(page + 1).catch(() =>
				toast.error(t('get_more_movies_failed'))
			);
		}
	};

	const label = {
		icon: 'eye',
		color: 'teal',
		ribbon: true,
		content: t('watched'),
		style: { position: 'absolute', top: '10px', left: '-14px' },
	};

	if (loading)
		return (
			<Segment>
				<BrowseLoader />
			</Segment>
		);

	return (
		<Segment>
			{movies.length === 0 ? (
				<Header>{t('no_results')}</Header>
			) : (
				<Item.Group divided>
					{movies.map((movie) => (
						<Item key={movie.imdb} as={Link} to={`/movies/${movie.imdb}`}>
							<Item.Image
								src={movie.coverImage}
								label={movie.watched ? label : null}
							/>
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
											<Label key={genre} style={{ marginBottom: 4 }}>
												{t(genre.toLowerCase())}
											</Label>
										))}
								</Item.Description>
							</Item.Content>
						</Item>
					))}
				</Item.Group>
			)}
			{totalPages !== page && totalPages !== 0 && (
				<Header>{t('load_more')}</Header>
			)}
			<Visibility onBottomVisible={() => getNext()} once={false} />
			{totalPages === page && totalPages !== 0 && (
				<Header>{t('no_more_results')}</Header>
			)}
		</Segment>
	);
};

export default observer(Browse);
