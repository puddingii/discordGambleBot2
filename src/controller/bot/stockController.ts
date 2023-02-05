import dayjs from 'dayjs';
import { startSession } from 'mongoose';
import User from '../../game/User/User';
import Stock from '../../game/Stock/Stock';
import Coin from '../../game/Stock/Coin';
import DataManager from '../../game/DataManager';
import Status from '../../model/Status';
import StockModel from '../../model/Stock';
import UserModel from '../../model/User';

const dataManager = DataManager.getInstance();
const stockManager = dataManager.get('stock');

type StockManager = typeof stockManager;

interface UpdateStatusParam {
	curCondition: StockManager['curCondition'];
	conditionRatioPerList: StockManager['conditionRatioPerList'];
	conditionPeriod: StockManager['conditionPeriod'];
}

interface DefaultStockParam {
	name: string;
	type: 'stock' | 'coin';
	value: number;
	comment: string;
	ratio: { min: number; max: number };
	correctionCnt: number;
	updateTime: number;
}

export interface StockParam extends DefaultStockParam {
	type: 'stock';
	conditionList: Array<number>;
	dividend: number;
}

export interface CoinParam extends DefaultStockParam {
	type: 'coin';
}

/** 주식정보 가져오기 */
export const getStock = (type: 'coin' | 'stock' | '', name: string) => {
	const stockManager = dataManager.get('stock');
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

/** 타입에 해당하는 모든 주식 가져오기 */
export const getAllStock = (type: 'coin' | 'stock' | 'all') => {
	const stockManager = dataManager.get('stock');
	const stockTypeList = ['coin', 'stock', 'all'];
	if (!stockTypeList.includes(type)) {
		throw Error('타입에러');
	}
	return stockManager.getAllStock(type);
};

/** 도박 컨텐츠 게임 상태값들 가져오기 */
export const getGambleStatus = () => {
	const stockManager = dataManager.get('stock');
	return {
		curCondition: stockManager.curCondition,
		conditionPeriod: stockManager.conditionPeriod,
		conditionRatioPerList: stockManager.conditionRatioPerList,
	};
};

/** 현재 주식흐름 */
export const getCurrentCondition = () => {
	const stockManager = dataManager.get('stock');
	return stockManager.curCondition;
};

/** 다음 컨디션 업데이트까지 남은시간 */
export const getNextUpdateTime = () => {
	const stockManager = dataManager.get('stock');
	const globalManager = dataManager.get('globalStatus');
	return (
		stockManager.conditionPeriod - (globalManager.curTime % stockManager.conditionPeriod)
	);
};

/** 차트 데이터 생성 */
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
	const xDataList: Array<string> = [];
	const yDataList: Array<Array<number> | number> = [];
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

/** 도박 컨텐츠 게임 상태값들 셋팅 */
export const setGambleStatus = async (status: Partial<UpdateStatusParam>) => {
	const { curCondition, conditionRatioPerList, conditionPeriod } = status;
	const stockManager = dataManager.get('stock');
	if (curCondition) {
		stockManager.curCondition = curCondition;
	}
	if (conditionPeriod) {
		stockManager.conditionPeriod = conditionPeriod;
	}
	if (conditionRatioPerList) {
		stockManager.conditionRatioPerList = conditionRatioPerList;
	}
	await Status.updateStatus({ gamble: status });
};

/** 주식 업데이트 */
export const updateStock = async (isNew: boolean, param: StockParam | CoinParam) => {
	const stockManager = dataManager.get('stock');
	if (isNew) {
		const stock = param.type === 'stock' ? new Stock(param) : new Coin(param);
		stockManager.addStock(stock);
		const session = await startSession();
		await session.withTransaction(async () => {
			const stockResult = await StockModel.addStock(stock);
			if (stockResult.code === 0) {
				throw Error(stockResult?.message ?? 'error');
			}
			await UserModel.addNewStock(stock.name);
		});
		await session.endSession();
		return;
	}

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
	await StockModel.updateStock(param);
};

/** 주식정보 갱신 및 배당금 지급 */
export const updateStockRandom = async (curTime: number) => {
	const stockManager = dataManager.get('stock');
	const { stockList, coinList } = stockManager.update(curTime);

	const totalList = [...stockList, ...coinList];
	if (totalList.length > 0) {
		await StockModel.updateStockList(totalList);
	}
};

/** 유저에게 배당금 주기 */
export const giveDividend = async (curTime: number) => {
	if (curTime % 48 !== 0) {
		return;
	}
	const userManager = dataManager.get('user');
	const userList = userManager.getUserList();
	let updUserList: User[] = [];
	updUserList = userList.filter(user => {
		const result = user.giveDividend();
		return !!result.code;
	});
	for await (const user of updUserList) {
		await UserModel.updateMoney(user.getId(), user.money);
	}
};

export const updateCondition = async (curTime: number) => {
	const stockManager = dataManager.get('stock');
	await stockManager.updateCondition(curTime);
};

export default {
	getAllStock,
	getStock,
	getChartData,
	getCurrentCondition,
	getNextUpdateTime,
	getGambleStatus,
	giveDividend,
	setGambleStatus,
	updateStock,
	updateStockRandom,
	updateCondition,
};
