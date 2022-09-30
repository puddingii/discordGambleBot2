import { Schema, Model, model, Types, HydratedDocument, Document } from 'mongoose';
import dayjs from 'dayjs';

import secretKey from '../config/secretKey';
import logger from '../config/logger';

import CoinClass from '../controller/Gamble/Coin';
import StockClass from '../controller/Gamble/Stock';

interface UpdatedStockInfo {
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
	name: string;
	type: string;
	value: number;
	comment: string;
	minRatio: number;
	maxRatio: number;
	updateTime: number;
	correctionCnt: number;
	updHistory: Types.Array<{ value: number; date?: string }>;
	conditionList: Types.Array<number>;
	dividend: number;
}

export interface IStockStatics extends Model<IStock> {
	findAllList(
		type: 'stock' | 'coin' | 'all',
	): Promise<HydratedDocument<IStock, IStockStatics>[]>;
	findByName(
		type: 'stock' | 'coin' | 'all',
	): Promise<HydratedDocument<IStock, IStockStatics>>;
	addStock(
		stockInfo: CoinClass | StockClass,
	): Promise<{ code: number; message?: string }>;
	updateStockList(updateList: (CoinClass | StockClass)[]): Promise<void>;
	updateStock(
		updatedStockInfo: CoinClass | StockClass,
	): Promise<{ code: number; message?: string }>;
}

const Stock = new Schema<IStock, IStockStatics>({
	/** 이름 */
	name: {
		type: String,
		unique: true,
		required: true,
	},
	/** 타입 (코인 or 주식) */
	type: {
		type: String,
		default: 'stock',
	},
	/** 1개당 가격 */
	value: {
		type: Number,
		default: 1000000,
	},
	/** 설명 */
	comment: {
		type: String,
		default: '',
	},
	/** 변동률 최소치 */
	minRatio: {
		type: Number,
		default: -0.05,
	},
	/** 변동률 최대치 */
	maxRatio: {
		type: Number,
		default: 0.05,
	},
	/** 업데이트 주기. 모든 코인, 주식 동일하게 2시간마다 */
	updateTime: {
		type: Number,
		default: secretKey.stockUpdateTime,
	},
	/** 조정주기 업데이트주기*cnt 시간(ex 업데이트 주기 2시간*4 = 8시간마다 조정) */
	correctionCnt: {
		type: Number,
		default: 4,
	},
	/** 주식 히스토리 */
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
	/** 환경에 영향을 받는정도 순서대로 [아무일없음,씹악재, 악재, 호재, 씹호재] */
	conditionList: {
		type: [Number],
		default: [0, -0.06, -0.04, 0.04, 0.06],
	},
	/** 배당 주식에만 해당함 */
	dividend: {
		type: Number,
		default: 0.005,
	},
});

/** Type에 맞는 주식정보 다 가져오기 */
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

/** 아이디로 유저정보 탐색 */
Stock.statics.findByName = async function (name: string) {
	const stockInfo = await this.findOne({ name });
	return stockInfo;
};

/** 주식정보 리스트째로 업데이트(주식 히스토리 추가 전용) */
Stock.statics.updateStockList = async function (updateList: (CoinClass | StockClass)[]) {
	const updPromiseList = updateList.map(async updStock => {
		const stock = await this.findOne({ name: updStock.name });
		if (stock) {
			stock.value = updStock.value;
			stock.updHistory.push({ value: updStock.value, date: dayjs().toDate().toString() });
			return stock.save();
		}
		return { status: 'rejected', reason: 'Class에 들어있는 주식정보가 DB에 없습니다.' };
	});

	const resultList = await Promise.allSettled(updPromiseList);

	resultList.forEach(result => {
		if (result.status !== 'fulfilled') {
			logger.error(`${result.reason}`);
		}
	});
};

/** 주식정보 업데이트 (히스토리 추가하지 않음. 어드민 전용) */
Stock.statics.updateStock = async function (updatedStockInfo: UpdatedStockInfo) {
	const stock = await this.findOne({ name: updatedStockInfo.name });
	if (!stock) {
		return { code: 0, message: '해당하는 주식이 없습니다.' };
	}
	stock.comment = updatedStockInfo.comment;
	stock.conditionList = new Types.Array(...updatedStockInfo.conditionList);
	stock.correctionCnt = updatedStockInfo.correctionCnt;
	stock.dividend = updatedStockInfo.dividend;
	stock.maxRatio = updatedStockInfo.maxRatio;
	stock.minRatio = updatedStockInfo.minRatio;
	stock.value = updatedStockInfo.value;
	await stock.save();
	return { code: 1 };
};

export default model<IStock, IStockStatics>('Stock', Stock);
