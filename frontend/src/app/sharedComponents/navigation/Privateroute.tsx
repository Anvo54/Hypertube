import React, { useContext } from 'react';
import {
	RouteProps,
	RouteComponentProps,
	Route,
	Redirect,
} from 'react-router-dom';
import { RootStoreContext } from '../../stores/rootStore';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface IProps extends RouteProps {
	component: React.ComponentType<RouteComponentProps<any>>;
}

const PrivateRoute: React.FC<IProps> = ({ component: Component, ...rest }) => {
	const { t } = useTranslation();
	const rootStore = useContext(RootStoreContext);
	const { token, logOutBtnClicked } = rootStore.userStore;

	const errorStr = !logOutBtnClicked
		? `?error-token=${encodeURI(t('not_authorized'))}`
		: '';

	return (
		<Route
			{...rest}
			render={(props) =>
				token ? <Component {...props} /> : <Redirect to={`/login${errorStr}`} />
			}
		/>
	);
};

export default observer(PrivateRoute);
