const mongoose = require('mongoose');
const StockModel = require('./Stock');
const logger = require('../config/logger');

const User = new mongoose.Schema({
	discordId: {
		type: String,
		unique: true,
		required: true,
	},
	nickname: {
		type: String,
		unique: true,
		required: true,
	},
	money: {
		type: Number,
		default: 1000000,
	},
	stockList: [
		{
			stock: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Stock',
			},
			cnt: {
				type: Number,
				default: 0,
			},
			value: {
				type: Number,
				required: true,
			},
		},
	],
	weaponList: [
		{
			/** 타입 weapon or pickaxe */
			type: {
				type: String,
				required: true,
			},
			/** 터진수 */
			destroyCnt: {
				type: Number,
				default: 0,
			},
			/** 실패수 */
			failCnt: {
				type: Number,
				default: 0,
			},
			/** 성공수 */
			successCnt: {
				type: Number,
				default: 0,
			},
			/** 현재 강화된 정도(파워는 강화된 수 * 3) */
			curPower: {
				type: Number,
				default: 0,
			},
			/** 추가 파워 */
			bonusPower: {
				type: Number,
				default: 0,
			},
			/** 최대 적중률은 300% */
			hitRatio: {
				type: Number,
				default: 1,
				max: 3,
			},
			/** 최대 회피율은 70% */
			missRatio: {
				type: Number,
				default: 0,
				max: 0.7,
			},
		},
	],
});

/**
 * 아이디로 유저정보 탐색
 * @this import('mongoose').Model
 * @param {string} discordId
 */
User.statics.findByDiscordId = async function (discordId) {
	const userInfo = await this.findOne({ discordId });
	return userInfo;
};

/**
 * 주식정보 업데이트
 * @this import('mongoose').Model
 * @param {string} discordId
 * @param {{ name: string, cnt: string, value: number, money: number }} updStockInfo
 */
User.statics.updateStock = async function (discordId, updStockInfo) {
	const userInfo = await this.findOne({ discordId }).populate('stockList.stock');
	if (!userInfo) {
		return { code: 0, message: '[DB]유저정보를 찾을 수 없습니다.' };
	}

	const myStock = userInfo.stockList.find(myStock => {
		return myStock.stock.name === updStockInfo.name;
	});

	if (myStock) {
		myStock.value = updStockInfo.value;
		myStock.cnt = updStockInfo.cnt;
	} else {
		const stock = await StockModel.findByName(updStockInfo.name);
		if (!stock) {
			return { code: 0, message: '[DB]주식정보를 찾을 수 없습니다.' };
		}
		userInfo.stockList.push({
			stock,
			value: updStockInfo.value,
			cnt: updStockInfo.cnt,
		});
	}
	userInfo.money = updStockInfo.money;

	await userInfo.save();
	return { code: 1 };
};

/**
 * 유저 머니 업데이트
 * @this import('mongoose').Model
 * @param {import('../controller/User')[]} userList
 */
User.statics.updateMoney = async function (userList) {
	const updPromiseList = userList.map(async updUser => {
		const user = await this.findOne({ discordId: updUser.getId() });
		user.money = updUser.money;
		return user.save();
	});

	const resultList = await Promise.allSettled(updPromiseList);

	resultList.forEach(result => {
		if (result.status !== 'fulfilled') {
			logger.error(`${result.reason}`);
		}
	});
	return { code: 1 };
};

/**
 * 무기 업데이트
 * @this import('mongoose').Model
 * @param {string} discordId
 * @param {import('../controller/Weapon/Sword')} updWeaponInfo
 * @param {number} money
 */
User.statics.updateWeapon = async function (discordId, updWeaponInfo, money) {
	const userInfo = await this.findOne({ discordId });
	if (!userInfo) {
		return { code: 0, message: '[DB]유저정보를 찾을 수 없습니다.' };
	}

	const myWeapon = userInfo.weaponList.find(weapon => {
		return weapon.type === updWeaponInfo.type;
	});

	if (myWeapon) {
		myWeapon.bonusPower = updWeaponInfo.bonusPower;
		myWeapon.curPower = updWeaponInfo.curPower;
		myWeapon.destroyCnt = updWeaponInfo.destroyCnt;
		myWeapon.failCnt = updWeaponInfo.failCnt;
		myWeapon.successCnt = updWeaponInfo.successCnt;
		myWeapon.hitRatio = updWeaponInfo.getHitRatio();
		myWeapon.missRatio = updWeaponInfo.getMissRatio();
	} else {
		userInfo.weaponList.push({
			type: updWeaponInfo.type,
			curPower: updWeaponInfo.curPower,
			failCnt: updWeaponInfo.failCnt,
			successCnt: updWeaponInfo.successCnt,
			destroyCnt: updWeaponInfo.destroyCnt,
			bonusPower: updWeaponInfo.bonusPower,
			hitRatio: updWeaponInfo.getHitRatio(),
			missRatio: updWeaponInfo.getMissRatio(),
		});
	}
	userInfo.money = money;

	await userInfo.save();
	return { code: 1 };
};

// 아래는 참고용 소스
// /**
//  * 아이디로 유저정보 탐색
//  * @this import('mongoose').Model
//  * @param {{userId: String, nickname?: String}}
//  */
// User.statics.findByWeb = async function (orOptions) {
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
// User.statics.addChannel = async function (userInfo, channelInfo) {
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

// /** 유저정보에 공부정보 추가 */
// User.statics.addStudy = async function (discordId, studyInfo) {
// 	const user = await this.findOne({ discordId }).populate('studyList');
// 	if (!user) {
// 		throw new Error('User is not found.');
// 	}

// 	user.studyList.push(studyInfo);
// 	await user.save();

// 	return 1;
// };

// /** 유저정보에 Todo정보 추가 */
// User.statics.addTodo = async function (discordId, todoInfo) {
// 	const user = await this.findOne({ discordId }).populate('todoList');
// 	if (!user) {
// 		throw new Error('User is not found.');
// 	}

// 	user.todoList.push(todoInfo);
// 	await user.save();

// 	return 1;
// };

// /**
//  * Random id 생성 후 저장 및 return
//  * @this import('mongoose').Model
//  * @param {String} discordId
//  */
// User.statics.getRandomId = async function (discordId) {
// 	const user = await this.findOne({ discordId });
// 	if (!user) {
// 		throw new Error('User is not found.');
// 	}

// 	const randomString = Math.random().toString(36).slice(2);
// 	user.accessKey = randomString;
// 	await user.save();

// 	return randomString;
// };

module.exports = mongoose.model('User', User);
