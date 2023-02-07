import { Request, Response } from 'express';
import _ from 'lodash';
import UserModel from '../../model/User';
import StatusModel from '../../model/Status';
import DataManager from '../../game/DataManager';

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

type PatchGiveMoneyBodyInfo = {
	myNickname: string;
	ptrNickname: string;
	money: number;
};

type PatchWeaponBodyInfo = {
	type: string;
	isPreventDestroy: boolean;
	isPreventDown: boolean;
};

const dataManager = DataManager.getInstance();

export const getUserProfileInfo = (req: Request, res: Response) => {
	try {
		const { user } = req;
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

		const totalStockValue = userInfo.stockList.reduce((acc, myStock) => {
			const stockInfo = myStock.stock;
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

export const getWeaponList = (req: Request, res: Response) => {
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

		const myWeaponList = userInfo.weaponList.map(weapon => ({
			bonusPower: weapon.bonusPower,
			curPower: weapon.curPower,
			destroyCnt: weapon.destroyCnt,
			failCnt: weapon.failCnt,
			hitRatio: weapon.hitRatio,
			missRatio: weapon.missRatio,
			successCnt: weapon.successCnt,
			name: weapon.weapon.name,
			type: weapon.weapon.type,
			comment: weapon.weapon.comment,
		}));

		return res.status(200).json(myWeaponList);
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
};

export const getNicknameList = (req: Request, res: Response) => {
	try {
		const userManager = dataManager.get('user');
		const userList = userManager.getUserList();
		return res.status(200).json(userList.map(user => user.nickname));
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
		const userInfo = userManager.getUser({ discordId: user.discordId });
		if (!userInfo) {
			throw Error('유저정보가 없습니다');
		}

		const stockInfo = stockManager.getStock('', stockName);
		if (!stockInfo) {
			throw Error('주식/코인정보가 없습니다');
		}

		const reCnt = type === 's' ? -1 * cnt : cnt;
		const stockResult = userInfo.updateStock(stockInfo, reCnt, false);
		await UserModel.updateStockAndMoney(
			userInfo.getId(),
			{
				name: stockInfo.name,
				cnt: stockResult.cnt,
				value: stockResult.value,
			},
			userInfo.money,
		);
		return res.status(200).json({ cnt: stockResult.cnt, value: stockResult.value });
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
};

export const patchGrantMoney = async (req: Request, res: Response) => {
	try {
		const { user } = req;
		const globalManager = dataManager.get('globalStatus');
		const userManager = dataManager.get('user');
		const userInfo = userManager.getUser({ discordId: user?.discordId });
		if (!userInfo || !user) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}

		const money = globalManager.grantMoney;
		userInfo.updateMoney(money);
		globalManager.updateGrantMoney(0);

		await dataManager.setTransaction();
		const session = dataManager.getSession();
		await session?.withTransaction(async () => {
			await UserModel.updateMoney(userInfo.getId(), userInfo.money, session);
			await StatusModel.updateStatus({ user: { grantMoney: globalManager.grantMoney } });
		});
		await dataManager.setTransaction(true);
		return res.status(200).json({ value: money });
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
};

export const patchGiveMoney = async (req: Request, res: Response) => {
	try {
		const { user } = req;
		const { myNickname, ptrNickname, money } =
			req.body as Partial<PatchGiveMoneyBodyInfo>;
		if (!user) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}

		if (!myNickname || !ptrNickname || !money) {
			throw Error('처리에 필요한 데이터가 부족합니다.');
		}
		const userManager = dataManager.get('user');
		const userInfo = userManager.getUser({ nickname: myNickname });
		const ptrUserInfo = userManager.getUser({ nickname: ptrNickname });
		if (!userInfo || !ptrUserInfo) {
			throw Error('유저정보가 없습니다.');
		}

		userInfo.updateMoney(money * -1);
		ptrUserInfo.updateMoney(money);
		await dataManager.setTransaction();
		const session = dataManager.getSession();
		await session?.withTransaction(async () => {
			await UserModel.updateMoney(userInfo.getId(), userInfo.money, session);
			await UserModel.updateMoney(ptrUserInfo.getId(), ptrUserInfo.money, session);
		});
		await dataManager.setTransaction(true);

		return res.status(200).json(null);
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
};

export const patchWeapon = async (req: Request, res: Response) => {
	try {
		const { user } = req;
		if (!user) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}

		const { type, isPreventDestroy, isPreventDown } =
			req.body as Partial<PatchWeaponBodyInfo>;
		const userManager = dataManager.get('user');
		const weaponManager = dataManager.get('weapon');
		const weaponInfo = weaponManager.getInfo({ type });
		const userInfo = userManager.getUser({ discordId: user.discordId });
		if (!userInfo) {
			throw Error('유저정보가 없습니다');
		}

		const myWeapon = userInfo.weaponList.find(weapon => weapon.weapon.type === type);
		if (!myWeapon) {
			throw Error('무기정보가 없습니다.');
		}

		const beforePower = myWeapon.curPower;

		/** 강화진행 */
		const enhanceResult = weaponManager.enhanceWeapon(weaponInfo, beforePower, {
			isPreventDestroy,
			isPreventDown,
		});
		const code = enhanceResult.code ?? 2;
		delete enhanceResult.code;
		userManager.updateWeapon(myWeapon, enhanceResult);

		// 강화비용 계산
		const cost = weaponInfo.getCost(beforePower, {
			isPreventDestroy,
			isPreventDown,
		});
		userInfo.updateMoney(-1 * cost, 'weapon');

		await UserModel.updateWeaponAndMoney(userInfo.getId(), myWeapon, userInfo.money);
		return res.status(200).json({ code, curPower: enhanceResult.curPower, beforePower });
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
	getNicknameList,
	getWeaponList,
	patchUserStock,
	patchGrantMoney,
	patchGiveMoney,
	patchWeapon,
};
