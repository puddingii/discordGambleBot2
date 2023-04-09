import { Schema, model } from 'mongoose';
import {
	IStatusModel,
	IStatusModelStatics,
	TUpdateStatusParam,
} from '../../interfaces/model/status';

const Status = new Schema<IStatusModel, IStatusModelStatics>({
	isTest: {
		type: Boolean,
		default: false,
	},
	user: {
		grantMoney: {
			type: Number,
			default: 0,
		},
	},
	gamble: {
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
			type: [Number],
			default: [4, 16, 16, 4],
		},
	},
});

Status.statics.getStatus = async function (isTest = false) {
	let status = await this.findOne({ isTest });
	if (!status) {
		status = await this.create({ isTest });
	}
	return status;
};

Status.statics.updateCurTime = async function (cnt: number, isTest = false) {
	await this.findOneAndUpdate(
		{ isTest },
		{
			$inc: { 'gamble.curTime': cnt },
		},
	);
};

Status.statics.updateStatus = async function (
	statusInfo: TUpdateStatusParam,
	isTest = false,
) {
	if (Object.keys(statusInfo).length === 0) {
		throw Error('아무 옵션도 없습니다.');
	}
	const updInfo: { [key: string]: number | Array<number> } = {};
	(Object.keys(statusInfo) as Array<keyof typeof statusInfo>).forEach(statusType => {
		const options = statusInfo[statusType];
		if (options && typeof options === 'object' && !Array.isArray(options)) {
			(Object.keys(options) as Array<keyof typeof options>).forEach(option => {
				if (options[option] === 0 || options[option]) {
					updInfo[`${statusType}.${option}`] = options[option];
				}
			});
		}
	});

	await this.findOneAndUpdate({ isTest }, { $set: updInfo }, { upsert: true });
};

export default model<IStatusModel, IStatusModelStatics>('Status', Status);
