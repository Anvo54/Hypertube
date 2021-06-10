import { makeAutoObservable, runInAction } from 'mobx';
import agent from '../services/agent';
import {
	IForgetPassword,
	IGetUser,
	ILoginFormValues,
	IRegisterFormValues,
	IResetPassword,
} from '../models/user';
import { RootStore } from './rootStore';
import { history } from '../..';
import { FORM_ERROR } from 'final-form';
import { MouseEvent } from 'react';
const RegErrorTypes = [
	'username',
	'email',
	'firstname',
	'lastname',
	'password',
];

export default class UserStore {
	rootStore: RootStore;
	loading = false;
	success = false;
	token: string | null = null;
	tokenExpiresDate: Date | null = null;
	logOutBtnClicked = false;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
		makeAutoObservable(this);
	}

	stopLoading = (): void => {
		this.loading = false;
	};

	logoutUser = async (callLogout: MouseEvent | null = null): Promise<void> => {
		if (callLogout) {
			try {
				const token = await this.getToken();
				await agent.User.logout(token);
			} catch (error) {
				console.log(error);
			}
		}
		runInAction(() => {
			if (callLogout) this.logOutBtnClicked = true;
			this.token = null;
			this.tokenExpiresDate = null;
		});
	};

	setToken = (token: string): void => {
		this.token = token;
		this.tokenExpiresDate = new Date(new Date().getTime() + 110000);
		this.logOutBtnClicked = false;
	};

	getToken = (): Promise<string> => {
		return new Promise(async (resolve) => {
			if (this.tokenExpiresDate && this.tokenExpiresDate > new Date())
				return resolve(this.token!);
			this.getNewToken()
				.then((newToken) => resolve(newToken))
				.catch(() => {
					/* empty on purpose, due to logout happens in getNewToken */
				});
		});
	};

	getNewToken = (): Promise<string> => {
		return new Promise(async (resolve, reject) => {
			try {
				const data = await agent.User.accessToken();
				this.setToken(data.accessToken);
				resolve(data.accessToken);
			} catch (error) {
				if (error.logUserOut) this.logoutUser();
				console.log(error);
				reject();
			}
		});
	};

	setSuccess = (): void => {
		this.success = true;
		setTimeout(() => {
			runInAction(() => {
				this.success = !this.success;
				history.push('/');
			});
		}, 3000);
	};

	registerUser = async (
		data: IRegisterFormValues
	): Promise<void | Record<string, any>> => {
		try {
			await agent.User.register(data);
			this.setSuccess();
		} catch (error) {
			if (error.response.data.message === 'Invalid data') {
				return error.response.data.errors.reduce((obj: any, item: string) => {
					RegErrorTypes.forEach((error) => {
						if (item.includes(error)) {
							obj[error] = item;
						}
					});
					return obj;
				}, {});
			}
			return { [FORM_ERROR]: error.response.data.errors };
		}
	};

	sendResetPassword = async (
		data: IResetPassword,
		code: string
	): Promise<void | Record<string, any>> => {
		try {
			await agent.User.reset(code, data);
			this.setSuccess();
		} catch (error) {
			return { [FORM_ERROR]: error.response.data.message };
		}
	};

	loginUser = async (
		data: ILoginFormValues
	): Promise<void | Record<string, any>> => {
		try {
			const user = await agent.User.login(data);
			this.setToken(user.accessToken);
			history.push('/movies');
		} catch (error) {
			return { [FORM_ERROR]: error.response.data.message };
		}
	};

	forgetPassword = async (
		data: IForgetPassword
	): Promise<void | Record<string, any>> => {
		try {
			await agent.User.forget(data);
			this.setSuccess();
		} catch (error) {
			return { [FORM_ERROR]: error.response.data.message };
		}
	};

	getUser = async (): Promise<IGetUser | null> => {
		try {
			const token = await this.getToken();
			return await agent.User.getProfile(token);
		} catch (error) {
			console.log(error);
			return null;
		}
	};

	updateUser = async (
		data: IRegisterFormValues
	): Promise<IGetUser | Record<string, any>> => {
		try {
			const token = await this.getToken();
			return await agent.User.update(token, data);
		} catch (error) {
			if (error.response.data.message === 'Invalid data') {
				return error.response.data.errors.reduce((obj: any, item: string) => {
					RegErrorTypes.forEach((error) => {
						if (item.includes(error)) {
							obj[error] = item;
						}
					});
					return obj;
				}, {});
			}
			return { [FORM_ERROR]: error.response.data.errors };
		}
	};
}
