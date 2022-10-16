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

interface DefaultStockParam {
	name: string;
	type: 'stock' | 'coin';
	value: number;
	comment: string;
	ratio: { min: number; max: number };
	correctionCnt: number;
	updateTime: number;
}

interface StockParam extends DefaultStockParam {
	type: 'stock';
	conditionList: Array<number>;
	dividend: number;
}

interface CoinParam extends DefaultStockParam {
	type: 'coin';
}

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

export const getStock = (type: 'coin' | 'stock' | '', name: string) => {
	const stockTypeList = ['coin', 'stock', 'all'];
	if (!stockTypeList.includes(type)) {
		throw Error('타입에러');
	}
	const stock = stockManager.getStock(type, name);
	if (!stock) {
		throw Error('이름에 해당하는 주식이 없습니다');
	}
	return stock;
};

export const getAllStock = (type: 'coin' | 'stock' | 'all') => {
	const stockTypeList = ['coin', 'stock', 'all'];
	if (!stockTypeList.includes(type)) {
		throw Error('타입에러');
	}
	return stockManager.getAllStock(type);
};

export const getGambleStatus = () => {
	return {
		curCondition: stockManager.curCondition,
		conditionPeriod: stockManager.conditionPeriod,
		conditionRatioPerList: stockManager.conditionRatioPerList,
	};
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

export const setGambleStatus = ({
	curCondition,
	conditionRatioPerList,
	conditionPeriod,
}: {
	curCondition?: typeof stockManager.curCondition;
	conditionRatioPerList?: typeof stockManager.conditionRatioPerList;
	conditionPeriod?: typeof stockManager.conditionPeriod;
}) => {
	if (curCondition) {
		stockManager.curCondition = curCondition;
	}
	if (conditionPeriod) {
		stockManager.conditionPeriod = conditionPeriod;
	}
	if (conditionRatioPerList) {
		stockManager.conditionRatioPerList = conditionRatioPerList;
	}
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

export const updateStock = (isNew: boolean, param: StockParam | CoinParam) => {
	if (isNew) {
		const stock = param.type === 'stock' ? new Stock(param) : new Coin(param);
		stockManager.addStock(stock);
	} else {
		const stock = stockManager.getStock(param.type, param.name);
		if (!stock) {
			throw Error(
				`해당하는 이름의 ${param.type === 'stock' ? '주식' : '코인'}이 없습니다.`,
			);
		}

		stock.comment = param.comment;
		stock.value = param.value;
		stock.setRatio({ min: param.ratio.min, max: param.ratio.min });
		stock.correctionCnt = param.correctionCnt;
		if (stock instanceof Stock && param.type === 'stock') {
			stock.conditionList = param.conditionList;
			stock.dividend = param.dividend;
		}
	}
};

/** 주식정보 갱신 및 배당금 지급 */
export const update = (
	curTime: number,
): { stockList: Array<Stock | Coin>; userList: User[] } => {
	// 이쪽 아래로 StockManager.update() 호출후 업데이트된 주
	const { stockList, coinList } = stockManager.update(curTime);
	const userList = userManager.getUserList();
	let updUserList: User[] = [];

	// 주식 배당금 시간값 가져와서
	if (curTime % 48 === 0) {
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
	getStock,
	getChartData,
	getCurrentCondition,
	getNextUpdateTime,
	getGambleStatus,
	setGambleStatus,
	updateStock,
	updateMoney,
	update,
};
