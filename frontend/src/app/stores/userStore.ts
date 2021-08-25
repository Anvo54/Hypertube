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
import { TFunction } from 'react-i18next';
import { toast } from 'react-toastify';

export type Languages = 'en' | 'fi' | 'ee';
export const languageArray = ['en', 'fi', 'ee'];

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
				// console.log(error);
			}
		}
		runInAction(() => {
			if (callLogout) this.logOutBtnClicked = true;
			this.token = null;
			this.tokenExpiresDate = null;
			this.rootStore.movieStore.movies = { count: 0, movies: [] };
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
				reject();
			}
		});
	};

	setSuccess = (): void => {
		this.success = true;
		setTimeout(() => {
			runInAction(() => {
				this.success = !this.success;
				if (this.token) return history.push('/movies');
				history.push('/');
			});
		}, 3000);
	};

	registerUser = async (
		data: IRegisterFormValues,
		t: TFunction<'translation'>
	): Promise<void | Record<string, any>> => {
		try {
			await agent.User.register(data);
			this.setSuccess();
		} catch (error) {
			if (error.response.data.errors) {
				const translatedErrors: { email?: string; username?: string } = {};
				const errors = error.response.data.errors;
				if (errors.email) translatedErrors.email = t('email_unique_error');
				if (errors.username)
					translatedErrors.username = t('username_unique_error');
				return translatedErrors;
			}
			return { [FORM_ERROR]: error.response.data.message };
		}
	};

	sendResetPassword = async (
		data: IResetPassword,
		code: string,
		t: TFunction<'translation'>
	): Promise<void | Record<string, any>> => {
		try {
			const user = await agent.User.reset(code, data);
			this.setToken(user.accessToken);
			this.setSuccess();
		} catch (error) {
			if (error.response.status === 404)
				return { [FORM_ERROR]: t('reset_code_invalid') };
			return { [FORM_ERROR]: t(error.response.data.message) };
		}
	};

	loginUser = async (
		data: ILoginFormValues,
		t: TFunction<'translation'>
	): Promise<void | Record<string, any>> => {
		try {
			const user = await agent.User.login(data);
			this.setToken(user.accessToken);
			await this.saveCurrentLanguage(t);
			history.push('/movies');
		} catch (error) {
			return { [FORM_ERROR]: t(error.response.data.message) };
		}
	};

	forgetPassword = async (
		data: IForgetPassword,
		t: TFunction<'translation'>
	): Promise<void | Record<string, any>> => {
		try {
			await agent.User.forget(data);
			this.setSuccess();
		} catch (error) {
			return { [FORM_ERROR]: t(error.response.data.message) };
		}
	};

	getCurrentUser = async (): Promise<IGetUser | null> => {
		try {
			const token = await this.getToken();
			return await agent.User.getCurrentProfile(token);
		} catch (error) {
			return null;
		}
	};

	updateUser = (
		data: FormData,
		t: TFunction<'translation'>
	): Promise<IGetUser | Record<string, string>> => {
		return new Promise(async (resolve) => {
			try {
				const token = await this.getToken();
				resolve(await agent.User.update(token, data));
			} catch (error) {
				if (error.response.data.errors) {
					const translatedErrors: { email?: string; username?: string } = {};
					const errors = error.response.data.errors;
					if (errors.email) translatedErrors.email = t('email_unique_error');
					if (errors.username)
						translatedErrors.username = t('username_unique_error');
					return resolve(translatedErrors);
				}
				resolve({ [FORM_ERROR]: error.response.data.message });
			}
		});
	};

	getUsersProfile = async (usersId: string): Promise<IGetUser | null> => {
		try {
			const token = await this.getToken();
			return await agent.User.getUsersProfile(token, usersId);
		} catch (error) {
			return null;
		}
	};

	saveCurrentLanguage = async (t: TFunction<'translation'>): Promise<void> => {
		const language = window.localStorage.getItem('i18nActiveLng');
		if (language && languageArray.includes(language)) {
			try {
				await this.updateLanguage(language as Languages);
			} catch (_error) {
				toast.error(t('error_language_save'));
			}
		} else {
			toast.error(t('error_language_save'));
		}
	};

	updateLanguage = async (language: Languages): Promise<void> => {
		try {
			const token = await this.getToken();
			await agent.User.changeLanguage(token, language);
		} catch (error) {
			throw error;
		}
	};
}
