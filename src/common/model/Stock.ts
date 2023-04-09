import { Schema, model } from 'mongoose';
import dayjs from 'dayjs';

import secretKey from '../../config/secretKey';
import { TPopulatedUserStockInfo } from '../../interfaces/game/user';
import { IStock2 } from '../../interfaces/game/stock';
import { IStock, IStockStatics } from '../../interfaces/model/stock';

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
	const historyList = await this.aggregate([
		{ $project: { name: '$name', updHistory: { $reverseArray: '$updHistory' } } },
		{ $match: { name } },
		{
			$unwind: { path: '$updHistory' },
		},
		{ $limit: limitedCnt },
		{
			$project: {
				value: '$updHistory.value',
				date: '$updHistory.date',
			},
		},
	]);

	return historyList.reverse();
};

Stock.statics.findAllList = async function (type: 'stock' | 'coin' | 'all') {
	const condition = type === 'all' ? {} : { type };
	const stockList = await this.aggregate([
		{ $match: condition },
		{
			$project: {
				name: '$name',
				type: '$type',
				value: '$value',
				comment: '$comment',
				minRatio: '$minRatio',
				maxRatio: '$maxRatio',
				updateTime: '$updateTime',
				correctionCnt: '$correctionCnt',
				conditionList: '$conditionList',
				dividend: '$dividend',
				beforeHistoryRatio: {
					$round: [
						{
							$divide: [
								{
									$subtract: [
										{ $arrayElemAt: ['$updHistory.value', -1] },
										{ $arrayElemAt: ['$updHistory.value', -2] },
									],
								},
								{ $arrayElemAt: ['$updHistory.value', -1] },
							],
						},
						2,
					],
				},
			},
		},
	]);
	return stockList ?? [];
};

Stock.statics.deleteStock = async function (name: string) {
	const result = await this.deleteOne({ name });
	return { cnt: result.deletedCount };
};

Stock.statics.addStock = async function (stockInfo: TPopulatedUserStockInfo['stock']) {
	const isExist = await this.exists({ name: stockInfo.name });
	if (isExist) {
		return { code: 0, message: '같은 이름이 있습니다.' };
	}
	const { min, max } = stockInfo.getRatio();
	const stock = await this.create({ ...stockInfo, minRatio: min, maxRatio: max });
	await stock.update({
		$push: { updHistory: { value: stockInfo.value, date: dayjs().toDate().toString() } },
	});
	return { code: 1 };
};

Stock.statics.findByName = async function (name: string) {
	const stockInfo = await this.aggregate([
		{ $match: { name } },
		{
			$project: {
				name: '$name',
				type: '$type',
				value: '$value',
				comment: '$comment',
				minRatio: '$minRatio',
				maxRatio: '$maxRatio',
				updateTime: '$updateTime',
				correctionCnt: '$correctionCnt',
				conditionList: '$conditionList',
				dividend: '$dividend',
				beforeHistoryRatio: {
					$round: [
						{
							$divide: [
								{
									$subtract: [
										{ $arrayElemAt: ['$updHistory.value', -1] },
										{ $arrayElemAt: ['$updHistory.value', -2] },
									],
								},
								{ $arrayElemAt: ['$updHistory.value', -1] },
							],
						},
						2,
					],
				},
			},
		},
	]);
	return stockInfo.at(0);
};

Stock.statics.updateStockList = async function (
	updateList: TPopulatedUserStockInfo['stock'][],
) {
	const updPromiseList = updateList.map(updStock => {
		return this.findOneAndUpdate(
			{ name: updStock.name },
			{
				$set: { value: updStock.value },
				$push: {
					updHistory: { value: updStock.value, date: dayjs().toDate().toString() },
				},
			},
		);
	});

	const resultList = await Promise.allSettled(updPromiseList);

	resultList.forEach(result => {
		if (result.status !== 'fulfilled') {
			throw Error(`${result.reason}`);
		}
	});
};

Stock.statics.updateStock = async function (
	updatedStockInfo: TPopulatedUserStockInfo['stock'],
) {
	const { max, min } = updatedStockInfo.getRatio();
	const updateInfo = {
		comment: updatedStockInfo.comment,
		correctionCnt: updatedStockInfo.correctionCnt,
		minRatio: min,
		maxRatio: max,
		value: updatedStockInfo.value,
	};

	if (updatedStockInfo.type === 'stock') {
		await this.findOneAndUpdate(
			{ name: updatedStockInfo.name },
			{
				...updateInfo,
				conditionList: (updatedStockInfo as IStock2).conditionList,
				dividend: (updatedStockInfo as IStock2).dividend,
			},
		);
		return;
	}

	await this.findOneAndUpdate({ name: updatedStockInfo.name }, updateInfo);
};

export default model<IStock, IStockStatics>('Stock', Stock);
