const mongoose = require('mongoose');
const dayjs = require('dayjs');
const secretKey = require('../config/secretKey');
const logger = require('../config/logger');

/**
 * @typedef {import('../controller/Gamble/Coin')} Coin
 * @typedef {import('../controller/Gamble/Stock')} Stock
 */

const Stock = new mongoose.Schema({
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
		type: Array,
		default: [0, -0.06, -0.04, 0.04, 0.06],
	},
	/** 배당 주식에만 해당함 */
	dividend: {
		type: Number,
		default: 0.005,
	},
});

/**
 * 아이디로 유저정보 탐색
 * @this import('mongoose').Model
 * @param {'stock' | 'coin' | 'all'} type
 * @param {string} discordId
 */
Stock.statics.findAllList = async function (type) {
	const condition = type === 'all' ? {} : { type };
	const stockList = await this.find(condition);
	return stockList;
};

/**
 * 아이디로 유저정보 탐색
 * @this import('mongoose').Model
 * @param {'stock' | 'coin' | 'all'} type
 * @param {string} discordId
 */
Stock.statics.addStock = async function (stockInfo) {
	const isExist = await this.exists({ name: stockInfo.name });
	if (isExist) {
		return { code: 0, message: '같은 이름이 있습니다.' };
	}
	await this.create(stockInfo);
	return { code: 1 };
};

/**
 * 아이디로 유저정보 탐색
 * @this import('mongoose').Model
 * @param {string} name
 */
Stock.statics.findByName = async function (name) {
	const stockInfo = await this.findOne({ name });
	return stockInfo;
};

/**
 * 주식정보 리스트째로 업데이트(주식 히스토리 추가 전용)
 * @this import('mongoose').Model
 * @param {Coin[] | Stock[]} updateList
 */
Stock.statics.updateStockList = async function (updateList) {
	const updPromiseList = updateList.map(async updStock => {
		const stock = await this.findOne({ name: updStock.name });
		stock.value = updStock.value;
		stock.updHistory = [
			...stock.updHistory,
			{ value: updStock.value, date: dayjs().toDate().toString() },
		];
		return stock.save();
	});

	const resultList = await Promise.allSettled(updPromiseList);

	resultList.forEach(result => {
		if (result.status !== 'fulfilled') {
			logger.error(`${result.reason}`);
		}
	});
};

/**
 * 주식정보 업데이트 (히스토리 추가하지 않음. 어드민 전용)
 * @this import('mongoose').Model
 * @param {Coin | Stock} updatedStockInfo
 */
Stock.statics.updateStock = async function (updatedStockInfo) {
	const stock = await this.findOne({ name: updatedStockInfo.name });
	if (!stock) {
		return { code: 0, message: '해당하는 주식이 없습니다.' };
	}
	Object.keys(updatedStockInfo).forEach(key => {
		if (key === 'name' || key === 'type') {
			return;
		}
		stock[key] = updatedStockInfo[key];
	});
	await stock.save();
	return { code: 1 };
};

// 아래는 참고용 소스
// /**
//  * 아이디로 유저정보 탐색
//  * @this import('mongoose').Model
//  * @param {{userId: String, nickname?: String}}
//  */
// Stock.statics.findByWeb = async function (orOptions) {
// 	const orOptionList = [];
// 	Object.entries(orOptions).forEach(([key, value]) => {
// 		const obj = {};
// 		obj[key] = value;
// 		orOptionList.push(obj);
// 	});

// 	const userInfo = await this.findOne({ $or: orOptionList });
// 	return userInfo;
// };

// /** 유저정보에 채널 추가 */
// Stock.statics.addChannel = async function (userInfo, channelInfo) {
// 	const user = await userInfo.populate('channelList');
// 	if (!user) {
// 		throw new Error('User is not found.');
// 	}
// 	if (user.channelList.find(dbChannel => dbChannel.channelId === channelInfo.channelId)) {
// 		return;
// 	}
// 	user.channelList.push(channelInfo);
// 	await user.save();

// 	return 1;
// };

module.exports = mongoose.model('Stock', Stock);
