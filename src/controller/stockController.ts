import { container } from '../settings/container';
import TYPES from '../interfaces/containerType';
import {
	IStockService,
	TStockType,
	TValidStockParam,
} from '../interfaces/services/stockService';
import { IStatusService, TGambleStatus } from '../interfaces/services/statusService';
import { IUserService } from '../interfaces/services/userService';
import { IStock2 } from '../interfaces/game/stock';
import { TUserGiftInfo } from '../interfaces/game/user';
import { ILogger } from '../util/logger';

/** 주식정보 가져오기 */
export const getStock = async (name: string) => {
	const stockService = container.get<IStockService>(TYPES.StockService);
	const stock = await stockService.getStock(name);
	return stock;
};

/** 타입에 해당하는 모든 주식 가져오기 */
export const getAllStock = async (type?: TStockType) => {
	const stockService = container.get<IStockService>(TYPES.StockService);
	const stockList = await stockService.getAllStock(type);
	return stockList;
};

/** 도박 컨텐츠 게임 상태값들 가져오기 */
export const getGambleStatus = async () => {
	const statusService = container.get<IStatusService>(TYPES.StatusService);
	const { conditionPeriod, conditionRatioPerList, curCondition } =
		await statusService.getGambleStatus();

	return {
		curCondition,
		conditionPeriod,
		conditionRatioPerList,
	};
};

/** 다음 컨디션 업데이트까지 남은시간 */
export const getNextUpdateTime = async () => {
	const statusService = container.get<IStatusService>(TYPES.StatusService);
	const { conditionPeriod, curTime } = await statusService.getGambleStatus();
	return conditionPeriod - (curTime % conditionPeriod);
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
}) => {
	const stockService = container.get<IStockService>(TYPES.StockService);
	const stickPerCnt = stickTime / 2;
	const list = await stockService.getStockUpdateHistoryList(stockName, stickPerCnt * 30);
	const chartData = stockService.convertListToChartData(list, stickPerCnt, chartType);

	return chartData;
};

/** 도박 컨텐츠 게임 상태값들 셋팅 */
export const setGambleStatus = async (status: Partial<TGambleStatus>) => {
	const statusService = container.get<IStatusService>(TYPES.StatusService);
	await statusService.setGambleStatus(status);
};

/** 주식추가 */
export const addStock = async (param: TValidStockParam) => {
	const stockService = container.get<IStockService>(TYPES.StockService);
	const userService = container.get<IUserService>(TYPES.UserService);
	const stock = await stockService.addStock(param);
	await userService.addStock(stock);
};

/** 주식 업데이트 */
export const updateStock = async (param: TValidStockParam) => {
	const stockService = container.get<IStockService>(TYPES.StockService);
	const stock = await stockService.getStock(param.name);
	await stockService.updateStock(stock, param);
};

/** 주식정보 갱신 및 배당금 지급 */
export const updateStockRandom = async () => {
	const stockService = container.get<IStockService>(TYPES.StockService);
	const statusService = container.get<IStatusService>(TYPES.StatusService);
	const { curTime, curCondition } = await statusService.getGambleStatus();
	const stockList = await stockService.getAllStock();
	await stockService.updateRandomStock(stockList, { curTime, curCondition });
};

/** 유저에게 배당금 주기 */
export const giveDividend = async () => {
	const statusService = container.get<IStatusService>(TYPES.StatusService);
	const userService = container.get<IUserService>(TYPES.UserService);
	const stockService = container.get<IStockService>(TYPES.StockService);
	const logger = container.get<ILogger>(TYPES.Logger);

	const { curTime } = await statusService.getGambleStatus();
	if (curTime % 48 !== 0) {
		return;
	}
	const userList = await userService.getAllUser(['stockList.stock']);

	const updateUserList = userList.map(user => {
		const giftList: Array<TUserGiftInfo> = [];
		user.stockList.forEach(stock => {
			const money = stockService.getStockDividend(stock.stock, stock.cnt);
			if (money) {
				giftList.push({
					type: 'money',
					value: money,
					comment: `${(<IStock2>stock.stock).name}의 배당금`,
				});
			}
		});
		return userService.addGiftList(user, giftList);
	});

	const resultList = await Promise.allSettled(updateUserList);

	resultList.forEach(result => {
		if (result.status !== 'fulfilled') {
			logger.error(`${result.reason}`, ['Controller']);
		}
	});
};

export const updateCondition = async () => {
	const statusService = container.get<IStatusService>(TYPES.StatusService);
	const statusInfo = await statusService.getGambleStatus();
	const curCondition = statusService.getRandomCondition(statusInfo);
	if (curCondition === -1) {
		return;
	}
	await statusService.setGambleStatus({ curCondition });
};

export default {
	addStock,
	getAllStock,
	getStock,
	getChartData,
	getNextUpdateTime,
	getGambleStatus,
	giveDividend,
	setGambleStatus,
	updateStock,
	updateStockRandom,
	updateCondition,
};
