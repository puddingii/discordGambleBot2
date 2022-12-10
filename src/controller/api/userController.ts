import { Request, Response } from 'express';

export const getUserInfo = (req: Request, res: Response) => {
	const { user } = req;
	return res.status(200).json(user);
};

export default {
	getUserInfo,
};
