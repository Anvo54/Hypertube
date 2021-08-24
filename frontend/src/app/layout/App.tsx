import React from 'react';
import MainContent from 'app/views/MainContent';
import Register from 'app/views/Register';
import Navigation from '../sharedComponents/navigation/Navigation';
import Privateroute from '../sharedComponents/navigation/Privateroute';
import { Switch, Route } from 'react-router';
import { Container, Dimmer, Loader, Message } from 'semantic-ui-react';
import { useContext, useEffect, useState } from 'react';
import { RootStoreContext } from 'app/stores/rootStore';
import { observer } from 'mobx-react-lite';
import { Redirect, useLocation } from 'react-router-dom';
import NotFound from 'app/views/NotFound';
import OAuthRoute from 'app/sharedComponents/navigation/OAuthRoute';
import ChangePassword from 'app/views/ChangePassword';
import Forgot from 'app/views/Forgot';
import Login from 'app/views/Login';
import Landing from 'app/views/landing/Landing';
import Movie from 'app/views/movieDetails/Movie';
import Profile from 'app/views/profile/Profile';
import { ToastContainer } from 'react-toastify';
import Footer from 'app/sharedComponents/Footer';
import { useTranslation } from 'react-i18next';

const App = () => {
	const { t } = useTranslation();
	const rootStore = useContext(RootStoreContext);
	const { token, getNewToken } = rootStore.userStore;
	const [message, setMessage] = useState('');
	const search = useLocation().search;
	const urlParams = new URLSearchParams(search);
	const emailStatus = urlParams.get('confirm-email');
	const oAuthError = urlParams.get('oauth-error');
	const tokenError = urlParams.get('error-token');
	const resetError = urlParams.get('reset-password');
	const code = urlParams.get('code');
	const state = urlParams.get('state');
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (emailStatus || oAuthError || tokenError || code || state) {
			setIsLoading(false);
			return;
		}

		getNewToken()
			.catch(() => {
				/* Fail silently */
			})
			.finally(() => setIsLoading(false));
	}, [code, emailStatus, getNewToken, oAuthError, state, tokenError]);

	useEffect(() => {
		if (emailStatus) {
			emailStatus === 'success' && setMessage(t('email_confirm_success'));
			emailStatus === 'error' && setMessage(t('email_confirm_error'));
			setTimeout(() => setMessage(''), 4000);
		}
	}, [emailStatus, t]);

	useEffect(() => {
		if (oAuthError) {
			setMessage(oAuthError);
			setTimeout(() => setMessage(''), 4000);
		}
	}, [oAuthError]);

	useEffect(() => {
		if (resetError) {
			setMessage(t('reset_code_invalid'));
			setTimeout(() => setMessage(''), 4000);
		}
	}, [resetError, t]);

	useEffect(() => {
		if (tokenError) {
			setMessage(tokenError);
			setTimeout(() => setMessage(''), 4000);
		}
	}, [tokenError]);

	const isMessageNegative =
		emailStatus === 'error' ||
		oAuthError !== null ||
		tokenError !== null ||
		resetError !== null;

	if (isLoading)
		return (
			<Dimmer active page>
				<Loader content={t('loading')} size="massive" />
			</Dimmer>
		);

	return (
		<>
			<Container>
				<ToastContainer />
				<Navigation token={token} />
				{message !== '' && (
					<Message
						style={{ marginTop: 80, marginBottom: -30 }}
						success={emailStatus === 'success'}
						negative={isMessageNegative}
					>
						{message}
					</Message>
				)}
				<Switch>
					<Route
						path="/register"
						render={() => {
							if (!token) return <Register />;
							return <Redirect to="/movies" />;
						}}
					/>
					<Route
						path="/login"
						render={() => {
							if (!token) return <Login />;
							return <Redirect to="/movies" />;
						}}
					/>
					<Route
						path="/forgot"
						render={() => {
							if (!token) return <Forgot />;
							return <Redirect to="/movies" />;
						}}
					/>
					<Route
						path="/reset-password/:id"
						render={() => {
							if (!token) return <ChangePassword />;
							return <Redirect to="/movies" />;
						}}
					/>
					<OAuthRoute path="/oauth" />
					<Privateroute path="/profile" component={Profile} />
					<Privateroute path="/movies/:id" component={Movie} />
					<Privateroute path="/movies" component={MainContent} />
					<Route exact path="/" component={Landing} />
					<Route component={NotFound} />
				</Switch>
			</Container>
			<Footer />
		</>
	);
};

export default observer(App);
