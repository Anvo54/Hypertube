import LinkModel from 'models/link';
import asyncHandler from 'express-async-handler';
import Usermodel from 'models/user';
import Debug from 'debug';
const debug = Debug('app');

export const confirmUserController = asyncHandler(async (req, res) => {
	const { userId, code } = req.codePayload!;
	const APP_URL = process.env.REACT_APP_BASE_URL!;

	try {
		await Usermodel.updateOne({ _id: userId }, { isConfirmed: true });
	} catch (err) {
		return res.redirect(302, `${APP_URL}?confirm-email=error`);
	}

	try {
		await LinkModel.deleteOne({ code });
	} catch (err) {
		debug(err);
	}

	res.redirect(302, `${APP_URL}?confirm-email=success`);
});
