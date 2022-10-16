import { Schema, Model, model, Types, HydratedDocument, Document } from 'mongoose';

interface DoucmentResult<T> {
	_doc: T;
}

interface IStatus extends Document, DoucmentResult<IStatus> {
	user: {
		grantMoney: number;
	};
	gamble: {
		curTime: number;
		curCondition: number;
		conditionPeriod: number;
		conditionRatioPerList: Types.Array<number>;
	};
}

interface IStatusStatics extends Model<IStatus> {
	getStatus(): Promise<HydratedDocument<IStatus, IStatusStatics>>;
	updateStatus(): Promise<{ code: number }>; // FIXME
}

const Status = new Schema<IStatus, IStatusStatics>({
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
			type: [Number],
			default: [4, 16, 16, 4],
		},
	},
});

Status.statics.getStatus = async function () {
	let status = await this.findOne({});
	if (!status) {
		status = await this.create({});
	}
	return status;
};

Status.statics.updateStatus = async function () {
	const status = await this.findOne({});
	if (!status) {
		return { code: 0 };
	}
	// status.user.grantMoney = statusInfo.grantMoney;
	// status.gamble.curTime = statusInfo.gamble.curTime;
	// status.gamble.curCondition = statusInfo.gamble.curCondition;
	// status.gamble.conditionPeriod = statusInfo.gamble.conditionPeriod;
	// status.gamble.conditionRatioPerList.splice(0);
	// status.gamble.conditionRatioPerList.push(...statusInfo.gamble.conditionRatioPerList);
	await status.save();

	return { code: 1 };
};

export default model<IStatus, IStatusStatics>('Status', Status);
