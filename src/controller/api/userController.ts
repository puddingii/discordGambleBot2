import { Request, Response } from 'express';
import _ from 'lodash';
import DataManager from '../../game/DataManager';
import { IStock } from '../../model/Stock';

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
	totalAvgValue: number;
	totalCurrentValue: number;
};

type PatchStockBodyInfo = {
	type: 'b' | 's';
	cnt: number;
	stockName: string;
};

const dataManager = DataManager.getInstance();

export const getUserInfo = (req: Request, res: Response) => {
	const { user } = req;
	if (!user) {
		return res.status(401);
	}
	return res.status(200).json(user);
};

export const patchUserStock = async (req: Request, res: Response) => {
	try {
		const { user, body } = req;
		const { cnt, stockName, type } = body as Partial<PatchStockBodyInfo>;
		if (!user) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}
		if (!cnt || !stockName || !type) {
			throw Error('데이터 오류');
		}
		const userManager = dataManager.get('user');
		const stockManager = dataManager.get('stock');
		const userInfo = dataManager.get('user').getUser({ discordId: user.discordId });
		if (!userInfo) {
			throw Error('유저정보가 없습니다');
		}

		const stockInfo = stockManager.getStock('', stockName);
		if (!stockInfo) {
			throw Error('주식/코인정보가 없습니다');
		}

		const reCnt = type === 's' ? -1 * Number(cnt) : Number(cnt);
		const stockResult = userInfo.updateStock(stockInfo, reCnt, false);
		await userManager.update({
			type: 'sm',
			userInfo,
			optionalInfo: {
				name: stockInfo.name,
				cnt: stockResult.cnt,
				value: stockResult.value,
			},
		});
		return res.status(200).json({ cnt: stockResult.cnt, value: stockResult.value });
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
};

export const getUserStockList = async (req: Request, res: Response) => {
	try {
		let user = req.user;
		if (!user) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}
		user = await user.populate('stockList.stock');
		if (!user) {
			return res.status(401).json({ message: '유저DB Error. 운영자에게 문의주세요' });
		}
		const myStockList = (
			user.stockList as { stock: IStock; cnt: number; value: number }[]
		).reduce(
			(acc: MyStockInfo, myStock) => {
				if (myStock.cnt > 0) {
					const myRatio = _.round((myStock.stock.value / myStock.value) * 100 - 100, 2);
					acc.totalAvgValue += myStock.cnt * myStock.value;
					acc.totalCurrentValue += myStock.cnt * myStock.stock.value;
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
			{ stockList: [], totalAvgValue: 0, totalCurrentValue: 0 },
		);
		myStockList.stockList = myStockList.stockList.map(stock => {
			const holdingRatio = _.round(
				((stock.cnt * stock.myValue) / myStockList.totalAvgValue) * 100,
				2,
			);
			return { ...stock, holdingRatio };
		});
		return res.status(200).json(myStockList);
	} catch (e) {
		return res.status(400);
	}
};

export default {
	getUserInfo,
	getUserStockList,
};
