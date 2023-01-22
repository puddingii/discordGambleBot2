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
	totalMyMoney: number;
};

type PatchStockBodyInfo = {
	type: 'b' | 's';
	cnt: number;
	stockName: string;
};

const dataManager = DataManager.getInstance();

export const getUserProfileInfo = async (req: Request, res: Response) => {
	try {
		const { user } = req;
		if (!user) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}

		const populatedUser = await user.populate('stockList.stock');
		if (!user) {
			return res.status(401).json({ message: '유저DB Error. 운영자에게 문의주세요' });
		}

		const totalStockValue = populatedUser.stockList.reduce((acc, myStock) => {
			const stockInfo = myStock.stock as IStock;
			const { cnt } = myStock;

			if (cnt > 0) {
				// 내가 가지고 있는 주식 갯수로 평균 매수위치 알기(내 평균값, 주식값)
				acc += cnt * stockInfo.value;
			}

			return acc;
		}, 0);
		const statusManager = dataManager.get('globalStatus');

		return res.status(200).json({
			nickname: user.nickname,
			totalStockValue,
			myMoney: user.money,
			grantMoney: statusManager.grantMoney,
		});
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
};

export const patchUserStock = async (req: Request, res: Response) => {
	try {
		const { user } = req;
		const { cnt, stockName, type } = req.body as Partial<PatchStockBodyInfo>;
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

export const getUserStockList = (req: Request, res: Response) => {
	try {
		const user = req.user;
		if (!user) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}
		const userManager = dataManager.get('user');
		const userInfo = userManager.getUser({ discordId: user.discordId });
		if (!userInfo) {
			return res.status(401).json({ message: '유저DB Error. 운영자에게 문의주세요' });
		}

		const myStockList = userInfo.stockList.reduce(
			(acc: MyStockInfo, myStock) => {
				let myRatio = 0;
				const stockInfo = myStock.stock;
				const { cnt, value: avgValue } = myStock;

				if (cnt > 0) {
					myRatio = _.round((stockInfo.value / avgValue) * 100 - 100, 2);
					// 내가 가지고 있는 주식 갯수로 평균 매수위치 알기(내 평균값, 주식값)
					acc.totalAvgValue += cnt * avgValue;
					acc.totalCurrentValue += cnt * stockInfo.value;
				}

				// 내 주식 정보
				acc.stockList.push({
					name: stockInfo.name,
					cnt: cnt,
					myValue: avgValue ?? 0,
					myRatio,
					stockValue: stockInfo.value,
					stockType: stockInfo.type,
					stockBeforeRatio: _.round(stockInfo.beforeHistoryRatio * 100, 2),
					profilMargin: cnt * (stockInfo.value - avgValue),
				});
				return acc;
			},
			{ stockList: [], totalAvgValue: 0, totalCurrentValue: 0, totalMyMoney: user.money },
		);

		// 각각의 주식의 가치비중 계산
		myStockList.stockList = myStockList.stockList.map(stock => {
			const holdingRatio = _.round(
				((stock.cnt * stock.myValue) / myStockList.totalAvgValue) * 100,
				2,
			);
			return { ...stock, holdingRatio };
		});
		return res.status(200).json(myStockList);
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
};

export default {
	getUserProfileInfo,
	getUserStockList,
};
