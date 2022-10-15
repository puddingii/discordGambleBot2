import dayjs from 'dayjs';
import User from '../game/User/User';
import Stock from '../game/Stock/Stock';
import Coin from '../game/Stock/Coin';
import DataManager from '../game/DataManager';
import StockModel from '../model/Stock';

const dataManager = DataManager.getInstance();
const userManager = dataManager.get('user');
const stockManager = dataManager.get('stock');
const globalManager = dataManager.get('globalStatus');

/** 주식사기 */
export const buySellStock = ({
	discordId,
	stockName,
	cnt,
	isFull,
}: {
	discordId: string;
	stockName: string;
	cnt: number;
	isFull: boolean;
}): { cnt: number; value: number; money: number } => {
	const userInfo = userManager.getUser({ discordId });
	if (!userInfo) {
		throw Error('유저정보가 없습니다');
	}

	const stockInfo = stockManager.getStock('', stockName);
	if (!stockInfo) {
		throw Error('주식/코인정보가 없습니다');
	}

	const stockResult = userInfo.updateStock(stockInfo, cnt, isFull);
	return stockResult;
};

export const getAllStock = (type: 'coin' | 'stock' | 'all') => {
	const stockTypeList = ['coin', 'stock', 'all'];
	if (!stockTypeList.includes(type)) {
		throw Error('Builder Error');
	}
	return stockManager.getAllStock(type);
};

/** 현재 주식흐름 */
export const getCurrentCondition = () => {
	return stockManager.curCondition;
};

/** 다음 컨디션 업데이트까지 남은시간 */
export const getNextUpdateTime = () => {
	return (
		stockManager.conditionPeriod - (globalManager.curTime % stockManager.curCondition)
	);
};

export const getChartData = async ({
	stockName,
	stickTime,
	chartType,
}: {
	stockName: string;
	stickTime: number;
	chartType: 'stick' | 'line';
}): Promise<{ xDataList: Array<string>; yDataList: Array<Array<number> | number> }> => {
	const type = 'stock';
	const stickPerCnt = stickTime / (type === 'stock' ? 2 : 0.5);
	const stockInfo = await StockModel.getUpdateHistory(stockName, stickPerCnt * 30);
	const stockCnt = stockInfo.length;

	let beforeHistory = 0;
	const xDataList = [];
	const yDataList = [];
	for (let i = 0; i < stockCnt; i += stickPerCnt) {
		const stickData = stockInfo.slice(i, i + stickPerCnt);
		const stickLastIdx = stickData.length - 1;
		if (stickData.length === -1) {
			break;
		}
		const valueList = stickData.map(data => data.value);
		beforeHistory && valueList.unshift(beforeHistory);
		const stickValue =
			chartType === 'stick'
				? [
						valueList[0],
						valueList[stickLastIdx],
						Math.min(...valueList),
						Math.max(...valueList),
				  ]
				: valueList[stickLastIdx];
		beforeHistory = valueList[stickLastIdx];
		xDataList.push(dayjs(stickData[0].date).format('MM.DD'));
		yDataList.push(stickValue);
	}

	return { xDataList, yDataList };
};

/** 돈 갱신 */
export const updateMoney = (discordId: string, value: number): User => {
	const userInfo = userManager.getUser({ discordId });
	if (!userInfo) {
		throw Error('유저정보가 없습니다');
	}
	userInfo.updateMoney(value);
	return userInfo;
};

/** 주식정보 갱신 및 배당금 지급 */
export const update = (): { stockList: Array<Stock | Coin>; userList: User[] } => {
	// 이쪽 아래로 StockManager.update() 호출후 업데이트된 주
	const { stockList, coinList } = stockManager.update();
	const userList = userManager.getUserList();
	let updUserList: User[] = [];

	// 주식 배당금 시간값 가져와서
	if (stockManager.curTime % 48 === 0) {
		updUserList = userList.filter(user => {
			const result = user.giveDividend();
			return !!result.code;
		});
	}

	return { stockList: [...stockList, ...coinList], userList: updUserList };
};

export default {
	buySellStock,
	getAllStock,
	getChartData,
	getCurrentCondition,
	getNextUpdateTime,
	updateMoney,
	update,
};
