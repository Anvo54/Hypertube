import asyncHandler from 'express-async-handler';
import LinkModel, { ILinkDocument, LinkType } from './../models/link';

export const checkCode = asyncHandler(async (req, res, next) => {
	const path = req.route.path.split('/')[1];
	const [userId, code] = req.params.code.split('_');

	if (!userId || !code) {
		// Path is reset-password or confirm-email
		return res.redirect(302, `http://localhost:3000/?${path}=error`);
	}

	let link: ILinkDocument | null = null;

	const linkType = path === 'confirm-email' ? LinkType.CONFIRM : LinkType.RESET;
	try {
		link = await LinkModel.findOne({ code, linkType, user: userId });
	} catch (err) {
		console.error(err);
	}

	if (!link) return res.redirect(302, `http://localhost:3000/?${path}=error`);

	req.codePayload = { userId, code };

	next();
});
