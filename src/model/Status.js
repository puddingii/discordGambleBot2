const mongoose = require('mongoose');

const Status = new mongoose.Schema({
	user: {
		grantMoney: {
			type: Number,
			default: 0,
		},
	},
	gamble: {
		/** 4의 배수 */
		curTime: {
			type: Number,
			default: 0,
		},
		curCondition: {
			type: Number,
			default: 0,
		},
		conditionPeriod: {
			type: Number,
			default: 24,
		},
		conditionRatioPerList: {
			type: Array,
			default: [4, 16, 16, 4],
		},
	},
});

/**
 * 아이디로 유저정보 탐색
 * @this import('mongoose').Model
 * @param {'game'} type
 */
Status.statics.getStatus = async function () {
	let status = await this.findOne({});
	if (!status) {
		status = await this.create({});
	}
	return status;
};

/**
 * 아이디로 유저정보 탐색
 * @this import('mongoose').Model
 * @param {import('../controller/Game')} statusInfo
 * @param {'game'} type
 */
Status.statics.updateStatus = async function (statusInfo) {
	const status = await this.findOne({});
	status.user.grantMoney = statusInfo.grantMoney;
	status.gamble.curTime = statusInfo.gamble.curTime;
	status.gamble.curCondition = statusInfo.gamble.curCondition;
	status.gamble.conditionPeriod = statusInfo.gamble.conditionPeriod;
	status.gamble.conditionRatioPerList = statusInfo.gamble.conditionRatioPerList;
	await status.save();

	return { code: 1 };
};

module.exports = mongoose.model('Status', Status);
