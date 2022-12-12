import { Request, Response } from 'express';
import { IUserInfo } from '../../model/User';

export const getUserInfo = (req: Request, res: Response) => {
	const { user } = req;
	if (!user) {
		return res.status(401);
	}
	return res.status(200).json(user);
};

export const getUserStockList = async (req: Request, res: Response) => {
	try {
		let user = req.user as IUserInfo;
		if (!user) {
			return res.status(401);
		}
		user = await user.populate('stockList.stock');
		return res.status(200).json(user.stockList);
	} catch (e) {
		return res.status(400);
	}
};

export default {
	getUserInfo,
};
