import { Request, Response } from 'express';
import _ from 'lodash';
import { IStock } from '../../model/Stock';
import { IUserInfo } from '../../model/User';

type MyStockInfo = {
	stockList: Array<{
		name: string;
		cnt: number;
		myRatio: number;
		myValue: number;
		stockValue: number;
		stockType: string;
		stockBeforeRatio: number;
		profilMargin: number;
		holdingRatio?: number;
	}>;
	totalMyValue: number;
	totalStockValue: number;
};

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
		const myStockList = (
			user.stockList as { stock: IStock; cnt: number; value: number }[]
		).reduce(
			(acc: MyStockInfo, myStock) => {
				if (myStock.cnt > 0) {
					const myRatio = _.round((myStock.stock.value / myStock.value) * 100 - 100, 2);
					acc.totalMyValue += myStock.cnt * myStock.value;
					acc.totalStockValue += myStock.cnt * myStock.stock.value;
					const beforeValue = myStock.stock.updHistory.at(-2)?.value ?? 0;
					let stockBeforeRatio = 0;
					if (beforeValue) {
						stockBeforeRatio =
							_.round((myStock.stock.value / beforeValue) * 100, 2) - 100;
					}

					acc.stockList.push({
						name: myStock.stock.name,
						cnt: myStock.cnt,
						myValue: myStock.value,
						myRatio,
						stockValue: myStock.stock.value,
						stockType: myStock.stock.type,
						stockBeforeRatio,
						profilMargin: myStock.cnt * (myStock.stock.value - myStock.value),
					});
				}
				return acc;
			},
			{ stockList: [], totalMyValue: 0, totalStockValue: 0 },
		);
		myStockList.stockList = myStockList.stockList.map(stock => {
			const holdingRatio =
				_.round((stock.cnt * stock.myValue) / myStockList.totalMyValue) * 100;
			return { ...stock, holdingRatio };
		});
		return res.status(200).json(myStockList);
	} catch (e) {
		return res.status(400);
	}
};

export default {
	getUserInfo,
};
