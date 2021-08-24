import {
	addCookiesToRes,
	createRefreshToken,
	createAccessToken,
	revokeCookies,
} from 'application/tokens';
import asyncHandler from 'express-async-handler';
import { Unauthorized } from 'http-errors';
import Usermodel, { IUserDocument } from 'models/user';
import { Request, Response } from 'express';

export const loginController = asyncHandler(async (req, res) => {
	const { username, password } = req.body;

	if (!password) throw new Unauthorized('Value for `password` is required.');

	const user: IUserDocument | null = await Usermodel.findOne({ username });

	if (!user) throw new Unauthorized('user_not_found');

	if (!user.isConfirmed) throw new Unauthorized('user_not_confirmed');

	if (!(await user.isPasswordValid(password)))
		throw new Unauthorized('wrong_password');

	// Set refreshToken cookie and return accessToken
	addCookiesToRes(res, createRefreshToken(user));
	res.json({ status: 'OK', accessToken: createAccessToken(user) });
});

export const logoutController = (_req: Request, res: Response): void => {
	revokeCookies(res);
	res.status(200).json({ status: 'OK' });
};
