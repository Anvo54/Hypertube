import React, { useContext } from 'react';
import {
	RouteProps,
	RouteComponentProps,
	Route,
	Redirect,
} from 'react-router-dom';
import { RootStoreContext } from '../../stores/rootStore';
import { observer } from 'mobx-react-lite';

interface IProps extends RouteProps {
	component: React.ComponentType<RouteComponentProps<any>>;
}

const PrivateRoute: React.FC<IProps> = ({ component: Component, ...rest }) => {
	const rootStore = useContext(RootStoreContext);
	const { token, logOutBtnClicked } = rootStore.userStore;

	const errorStr = !logOutBtnClicked
		? '?error-token=Not+authorized.+Please+login+in.'
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
