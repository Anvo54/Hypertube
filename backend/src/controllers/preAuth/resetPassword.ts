import {
	addCookiesToRes,
	createRefreshToken,
	createAccessToken,
} from 'application/tokens';
import LinkModel, { ILink, LinkType } from 'models/link';
import UserModel from 'models/user';
import { BadRequest } from 'http-errors';
import Usermodel from 'models/user';
import asyncHandler from 'express-async-handler';
import { getRandomString } from 'utils';
import { sendResetPasswordEmail } from 'utils/email';
import { Request, Response } from 'express';

export const sendResetPasswordController = asyncHandler(async (req, res) => {
	const { email } = req.body;
	const RESET = LinkType.RESET;

	const user = await Usermodel.findOne({ email });
	if (!user) throw new BadRequest('invalid_email');

	const link = await LinkModel.findOne({ user: user.id, linkType: RESET });
	if (link) throw new BadRequest('reset_already_requested');

	const code = getRandomString();
	const title = 'Reset your password for Hypertube';
	await sendResetPasswordEmail(email, title, user.id, code);
	const linkObj: ILink = { user: user.id, linkType: RESET, code };
	await LinkModel.create(linkObj);

	res.status(200).json({ status: 'OK' });
});

export const validResetCodeController = (req: Request, res: Response): void => {
	const code = req.params.code;
	const APP_URL = process.env.REACT_APP_BASE_URL!;

	res.redirect(302, `${APP_URL}/reset-password/${code}`);
};

export const resetPasswordController = asyncHandler(async (req, res) => {
	const { userId, code } = req.codePayload!;
	const password = req.body.password;

	if (!password) throw new BadRequest('Value for `password` is required.');

	const user = await UserModel.findOne({ _id: userId });
	if (!user) throw new BadRequest('user_not_found');

	if (await user.isPasswordValid(password))
		throw new BadRequest('new_password_same_as_old');

	// Throws error if password does not meet requirements
	await user.checkAndUpdatePassword(password);
	user.tokenVersion! += 1;

	await LinkModel.deleteOne({ code, user: user.id, linkType: LinkType.RESET });

	// Set refreshToken cookie and return accessToken
	addCookiesToRes(res, createRefreshToken(user));
	res.json({ status: 'OK', accessToken: createAccessToken(user) });
});
