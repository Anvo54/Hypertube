import { RootStoreContext } from 'app/stores/rootStore';
import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Header, Segment, Container, Button } from 'semantic-ui-react';
import './landing.css';

const MainContentPublic: React.FC = () => {
	const rootStore = useContext(RootStoreContext);
	const { token } = rootStore.userStore;
	const { t } = useTranslation();
	return (
		<Segment
			textAlign="center"
			style={{ minHeight: 700, padding: '1em 0em' }}
			vertical
		>
			<Container text>
				<Header as="h1" content={t('landing_title')} id="landing-title" />
				<Header
					as="h2"
					content={t('landing_subtitle')}
					style={{
						fontSize: '1.7em',
						fontWeight: 'normal',
						marginTop: '1.5em',
					}}
				/>
				<Button
					color="teal"
					as={Link}
					to={token ? '/movies' : '/register'}
					size="huge"
					content={token ? t('landing_btn_movies') : t('landing_btn_start')}
				/>
			</Container>
		</Segment>
	);
};

export default MainContentPublic;
