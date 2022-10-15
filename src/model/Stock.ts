import { Schema, Model, model, Types, HydratedDocument, Document } from 'mongoose';
import dayjs from 'dayjs';

import secretKey from '../config/secretKey';
import logger from '../config/logger';

import CoinClass from '../controller/Gamble/Coin';
import StockClass from '../controller/Gamble/Stock';

export interface UpdatedStockInfo {
	name: string;
	type: string;
	value: number;
	comment: string;
	minRatio: number;
	maxRatio: number;
	correctionCnt: number;
	conditionList: number[];
	dividend: number;
}

interface DoucmentResult<T> {
	_doc: T;
}

export interface IStock extends Document, DoucmentResult<IStock> {
	/** 이름 */
	name: string;
	/** 타입 (코인 or 주식) */
	type: string;
	/** 1개당 가격 */
	value: number;
	/** 설명 */
	comment: string;
	/** 변동률 최소치 */
	minRatio: number;
	/** 변동률 최대치 */
	maxRatio: number;
	/** 업데이트 주기. 모든 코인, 주식 동일하게 2시간마다 */
	updateTime: number;
	/** 조정주기 업데이트주기*cnt 시간(ex 업데이트 주기 2시간*4 = 8시간마다 조정) */
	correctionCnt: number;
	/** 주식 히스토리 */
	updHistory: Types.Array<{ value: number; date: string }>;
	/** 환경에 영향을 받는정도 순서대로 [아무일없음,씹악재, 악재, 호재, 씹호재] */
	conditionList: Types.Array<number>;
	/** 배당 주식에만 해당함 */
	dividend: number;
}

export interface IStockStatics extends Model<IStock> {
	/** Type에 맞는 주식정보 다 가져오기 */
	findAllList(
		type: 'stock' | 'coin' | 'all',
	): Promise<HydratedDocument<IStock, IStockStatics>[]>;

	/** 주식이름으로 주식정보 찾아오기 */
	findByName(name: string): Promise<HydratedDocument<IStock, IStockStatics>>;

	/** 주식추가 */
	addStock(
		stockInfo: CoinClass | StockClass,
	): Promise<{ code: number; message?: string }>;

	/** 업데이트 히스토리 가져오기 */
	getUpdateHistory(name: string, limitedCnt: number): Promise<IStock['updHistory']>;

	/** 주식 List 업데이트(주식 히스토리 누적) */
	updateStockList(updateList: (CoinClass | StockClass)[]): Promise<void>;

	/** 주식 단일 업데이트(주식 히스토리 미누적) */
	updateStock(
		updatedStockInfo: UpdatedStockInfo,
	): Promise<{ code: number; message?: string }>;
}

const Stock = new Schema<IStock, IStockStatics>({
	name: {
		type: String,
		unique: true,
		required: true,
	},
	type: {
		type: String,
		default: 'stock',
	},
	value: {
		type: Number,
		default: 1000000,
	},
	comment: {
		type: String,
		default: '',
	},
	minRatio: {
		type: Number,
		default: -0.05,
	},
	maxRatio: {
		type: Number,
		default: 0.05,
	},
	updateTime: {
		type: Number,
		default: secretKey.stockUpdateTime,
	},
	correctionCnt: {
		type: Number,
		default: 4,
	},
	updHistory: [
		{
			value: {
				type: Number,
				required: true,
			},
			date: {
				type: String,
				default: () => {
					return dayjs().toDate().toString();
				},
			},
		},
	],
	conditionList: {
		type: [Number],
		default: [0, -0.06, -0.04, 0.04, 0.06],
	},
	dividend: {
		type: Number,
		default: 0.005,
	},
});

Stock.statics.getUpdateHistory = async function (name: string, limitedCnt: number) {
	const stock = await this.findOne({ name });
	const historyList = stock?.updHistory ?? [];
	let sliceCnt = 0;
	if (limitedCnt < historyList.length) {
		sliceCnt = historyList.length - limitedCnt;
	}
	return historyList.slice(sliceCnt) ?? [];
};

Stock.statics.findAllList = async function (type: 'stock' | 'coin' | 'all') {
	const condition = type === 'all' ? {} : { type };
	const stockList = await this.find(condition);
	return stockList ?? [];
};

Stock.statics.addStock = async function (stockInfo: CoinClass | StockClass) {
	const isExist = await this.exists({ name: stockInfo.name });
	if (isExist) {
		return { code: 0, message: '같은 이름이 있습니다.' };
	}
	await this.create(stockInfo);
	return { code: 1 };
};

Stock.statics.findByName = async function (name: string) {
	const stockInfo = await this.findOne({ name });
	return stockInfo;
};

Stock.statics.updateStockList = async function (updateList: (CoinClass | StockClass)[]) {
	const updPromiseList = updateList.map(async updStock => {
		const stock = await this.findOne({ name: updStock.name });
		if (stock) {
			stock.value = updStock.value;
			stock.updHistory.push({ value: updStock.value, date: dayjs().toDate().toString() });
			return stock.save();
		}
		const errorPromise = new Promise((_, reject) => {
			reject(new Error('Class에 들어있는 주식정보가 DB에 없습니다.'));
		});
		return errorPromise;
	});

	const resultList = await Promise.allSettled(updPromiseList);

	resultList.forEach(result => {
		if (result.status !== 'fulfilled') {
			logger.error(`${result.reason}`);
		}
	});
};

Stock.statics.updateStock = async function (updatedStockInfo: UpdatedStockInfo) {
	const stock = await this.findOne({ name: updatedStockInfo.name });
	if (!stock) {
		return { code: 0, message: '해당하는 주식이 없습니다.' };
	}
	stock.comment = updatedStockInfo.comment;
	stock.conditionList.splice(0);
	stock.conditionList.push(...updatedStockInfo.conditionList);
	stock.correctionCnt = updatedStockInfo.correctionCnt;
	stock.dividend = updatedStockInfo.dividend;
	stock.maxRatio = updatedStockInfo.maxRatio;
	stock.minRatio = updatedStockInfo.minRatio;
	stock.value = updatedStockInfo.value;
	await stock.save();
	return { code: 1 };
};

export default model<IStock, IStockStatics>('Stock', Stock);
