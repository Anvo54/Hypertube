import agent from 'app/services/agent';
import { LinkType } from 'app/stores/oAuthStore';
import { RootStoreContext } from 'app/stores/rootStore';
import React, { useContext, useEffect, useState } from 'react';
import { Route, Redirect, RouteProps, useLocation } from 'react-router-dom';
import { Dimmer, Loader } from 'semantic-ui-react';

interface IProps extends RouteProps {}

const OAuthRoute: React.FC<IProps> = ({ ...rest }) => {
	const rootStore = useContext(RootStoreContext);
	const { setToken } = rootStore.userStore;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(true);
	const queryParams = new URLSearchParams(useLocation().search);
	const code = queryParams.get('code');
	const state = queryParams.get('state');
	const linkType = rootStore.oAuthStore.consumeLinkClicked();

	useEffect(() => {
		if (code && state && linkType) {
			if (linkType === LinkType.GITHUB || linkType === LinkType.CODE_42) {
				agent.OAuth.verifyOAuthUser(linkType, code, state)
					.then((res) => {
						setToken(res.accessToken);
						setError(false);
					})
					.catch((err) => console.log(err))
					.finally(() => setLoading(false));
			}
		} else setLoading(false);
	}, [code, state]);

	return (
		<Route
			{...rest}
			render={() =>
				loading ? (
					<Dimmer active page>
						<Loader content="Getting data..." size="massive" />
					</Dimmer>
				) : error ? (
					<Redirect to="/?oauth-error=Authentication+failed,+try+again+later." />
				) : (
					<Redirect to="/movies" />
				)
			}
		/>
	);
};

export default OAuthRoute;