import dayjs from 'dayjs';
import { inject, injectable } from 'inversify';
import TYPES from '../../interfaces/containerType';
import Stock from '../game/Stock/Stock';
import Coin from '../game/Stock/Coin';
import { TPopulatedUserStockInfo, TUserStockInfo } from '../../interfaces/game/user';
import {
	IStockService,
	TStockName,
	TValidStockParam,
	TValidCoinParam,
} from '../../interfaces/common/services/stockService';
import { ICoin, IStock } from '../../interfaces/game/stock';

@injectable()
class StockService implements IStockService {
	stockModel: IStockService['stockModel'];

	constructor(@inject(TYPES.StockModel) stockModel: IStockService['stockModel']) {
		this.stockModel = stockModel;
	}

	convertListToChartData(
		list: { value: number; date: string }[],
		stackCnt: number,
		chartType: 'stick' | 'line',
	) {
		const listLen = list.length;
		const xDataList: Array<string> = [];
		const yDataList: Array<Array<number> | number> = [];
		let beforeHistory = 0;
		for (let i = 0; i < listLen; i += stackCnt) {
			const stickData = list.slice(i, i + stackCnt);
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
	}

	getStockDividend(stock: TUserStockInfo['stock'], cnt: number) {
		if (!(stock instanceof Stock)) {
			return 0;
		}
		return stock.value * cnt * stock.dividend;
	}

	/** 코인 값 유효성 검사 */
	private isValidCoinParam(param: TValidCoinParam): { code: number; message?: string } {
		const MAX_RATIO = 0.2;

		/** 비율이 일정 수준이 넘었는지 */
		const isOverMaxRatio = (ratio: number) => {
			return Math.abs(ratio) > MAX_RATIO;
		};

		if (isOverMaxRatio(param.ratio.min) || isOverMaxRatio(param.ratio.max)) {
			return { code: 0, message: '모든 비율은 +-0.2퍼센트 초과로 지정할 수 없습니다.' };
		}

		return { code: 1 };
	}

	/** 주식 값 유효성 검사 */
	private isValidStockParam(param: TValidStockParam): {
		code: number;
		message?: string;
	} {
		const MAX_RATIO = 0.2;
		if (param.conditionList.length !== 5) {
			return {
				code: 0,
				message: '조정 퍼센트 입력형식이 이상합니다. 다시 입력해주세요.',
			};
		}

		/** 비율이 일정 수준이 넘었는지 */
		const isOverMaxRatio = (ratio: number) => {
			return Math.abs(ratio) > MAX_RATIO;
		};

		if (
			isOverMaxRatio(param.ratio.min) ||
			isOverMaxRatio(param.ratio.max) ||
			isOverMaxRatio(param.dividend) ||
			param.conditionList.some(isOverMaxRatio)
		) {
			return { code: 0, message: '모든 비율은 +-0.2퍼센트 초과로 지정할 수 없습니다.' };
		}

		return { code: 1 };
	}

	async addCoin(stockInfo: TValidCoinParam) {
		const result = this.isValidCoinParam(stockInfo);
		if (result.code === 0) {
			throw Error(result.message);
		}
		const coin = new Coin({
			name: stockInfo.name,
			ratio: { min: stockInfo.ratio.min, max: stockInfo.ratio.max },
			type: stockInfo.type,
			updateTime: stockInfo.updateTime,
			value: stockInfo.value,
			comment: stockInfo.comment,
			correctionCnt: stockInfo.correctionCnt,
		});
		await this.stockModel.addStock(coin);

		return coin;
	}

	async addStock(stockInfo: TValidStockParam) {
		const result = this.isValidStockParam(stockInfo);
		if (result.code === 0) {
			throw Error(result.message);
		}
		const stock = new Stock({
			name: stockInfo.name,
			ratio: { min: stockInfo.ratio.min, max: stockInfo.ratio.max },
			type: stockInfo.type,
			updateTime: stockInfo.updateTime,
			value: stockInfo.value,
			comment: stockInfo.comment,
			conditionList: stockInfo.conditionList,
			correctionCnt: stockInfo.correctionCnt,
			dividend: stockInfo.dividend,
		});
		await this.stockModel.addStock(stock);

		return stock;
	}

	async getAllStock(type?: TStockName) {
		const stockList = await this.stockModel.findAllList(type || 'all');

		return stockList.map(
			stockInfo =>
				new Stock({
					name: stockInfo.name,
					ratio: { min: stockInfo.minRatio, max: stockInfo.maxRatio },
					type: <'stock'>stockInfo.type,
					updateTime: stockInfo.updateTime,
					value: stockInfo.value,
					comment: stockInfo.comment,
					conditionList: stockInfo.conditionList,
					correctionCnt: stockInfo.correctionCnt,
					dividend: stockInfo.dividend,
					beforeHistoryRatio: stockInfo.beforeHistoryRatio,
				}),
		);
	}

	async getStock(stockName: string) {
		const stockInfo = await this.stockModel.findByName(stockName);
		if (!stockInfo) {
			throw Error('이름에 해당하는 주식이 없습니다');
		}
		if (stockInfo.type === 'stock') {
			return new Stock({
				name: stockInfo.name,
				ratio: { min: stockInfo.minRatio, max: stockInfo.maxRatio },
				type: <'stock'>stockInfo.type,
				updateTime: stockInfo.updateTime,
				value: stockInfo.value,
				comment: stockInfo.comment,
				conditionList: stockInfo.conditionList,
				correctionCnt: stockInfo.correctionCnt,
				dividend: stockInfo.dividend,
				beforeHistoryRatio: stockInfo.beforeHistoryRatio,
			});
		}
		return new Coin({
			name: stockInfo.name,
			ratio: { min: stockInfo.minRatio, max: stockInfo.maxRatio },
			type: <'coin'>stockInfo.type,
			updateTime: stockInfo.updateTime,
			value: stockInfo.value,
			comment: stockInfo.comment,
			correctionCnt: stockInfo.correctionCnt,
			beforeHistoryRatio: stockInfo.beforeHistoryRatio,
		});
	}

	async getStockUpdateHistoryList(stockName: string, limitedCnt: number) {
		await this.getStock(stockName);
		const historyList = await this.stockModel.getUpdateHistory(stockName, limitedCnt);
		return historyList;
	}

	async updateCoin(stock: ICoin, param: TValidCoinParam) {
		const result = this.isValidCoinParam(param);
		if (result.code === 0) {
			throw Error(result.message);
		}
		stock.comment = param.comment;
		stock.value = param.value;
		stock.setRatio({ min: param.ratio.min, max: param.ratio.min });
		stock.correctionCnt = param.correctionCnt;

		await this.stockModel.updateStock(stock);
	}

	async updateRandomStock(
		stockList: Array<TPopulatedUserStockInfo['stock']>,
		status: { curCondition: number; curTime: number },
	) {
		const updatedList: Array<TPopulatedUserStockInfo['stock']> = [];
		stockList.forEach(stock => {
			const result = stock.update(status.curTime, status.curCondition);
			result.code && updatedList.push(stock);
		});
		await this.stockModel.updateStockList(updatedList);
	}

	async updateStock(stock: IStock, param: TValidStockParam): Promise<void> {
		const result = this.isValidStockParam(param);
		if (result.code === 0) {
			throw Error(result.message);
		}
		stock.comment = param.comment;
		stock.value = param.value;
		stock.setRatio({ min: param.ratio.min, max: param.ratio.max });
		stock.correctionCnt = param.correctionCnt;
		stock.conditionList = param.conditionList;
		stock.dividend = param.dividend;

		await this.stockModel.updateStock(stock);
	}
}

export default StockService;
