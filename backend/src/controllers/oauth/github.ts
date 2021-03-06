import { BadRequest } from 'http-errors';
import asyncHandler from 'express-async-handler';
import { saveUrlImgToProfileImages } from './../../utils/index';
import UserModel, { IUser } from './../../models/user';
import { Request, Response } from 'express';
import { getRandomString } from 'utils';
import serviceGithub from 'services/oauth/github';
import {
	addCookiesToRes,
	createAccessToken,
	createRefreshToken,
} from 'application/tokens';

export const oAuthGithubController = asyncHandler(
	async (req, res): Promise<void> => {
		const code = req.oAuthPayload!.code;

		const userData = await serviceGithub.getUser(code);
		if (!userData.email) {
			const params: any = {};
			params.username = userData.login;
			if (userData.name) {
				const names = userData.name.split(' ');
				if (names[0]) params.firstName = names[0];
				if (names[0] !== names[names.length - 1])
					params.lastName = names[names.length - 1];
			}
			throw new BadRequest(params);
		}

		let currentUser = await UserModel.findOne({ email: userData.email });

		if (!currentUser) {
			const username = getRandomString(10);
			let names: string[] = [];
			if (userData.name) {
				names = userData.name.split(' ');
			}
			const firstName = !names.length ? null : names[0];
			const lastName = !names.length ? null : names[names.length - 1];
			const user: IUser = {
				email: userData.email,
				firstName: firstName || 'FirstName',
				lastName: lastName || 'LastName',
				password: getRandomString(),
				isConfirmed: true,
				username,
			};
			currentUser = await UserModel.create(user);
			// Add pic for user now, else if validation fails pic still gets created
			let picName: string | undefined = `${username}-profile.jpg`;
			try {
				await saveUrlImgToProfileImages(userData.avatar_url, picName);
			} catch (err) {
				picName = undefined;
			}
			if (picName) currentUser.updateOne({ profilePicName: picName }).exec();
		} else if (!currentUser.isConfirmed) {
			await currentUser.updateOne({ isConfirmed: true });
		}

		// Set refreshToken cookie and return accessToken
		addCookiesToRes(res, createRefreshToken(currentUser));
		res.json({ status: 'OK', accessToken: createAccessToken(currentUser) });
	}
);

export const oAuthGithubLinkController = (
	_req: Request,
	res: Response
): void => {
	const API_ID = process.env.GITHUB_API_ID;
	const STATE = encodeURIComponent(process.env.GITHUB_STATE_SECRET!);
	const URL = process.env.GITHUB_URL_OAUTH;
	const link = `${URL}authorize?client_id=${API_ID}&scope=read:user%20user:email&state=${STATE}`;

	res.json({ status: 'OK', link });
};
