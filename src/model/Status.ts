import { Schema, Model, model, Types, HydratedDocument, Document } from 'mongoose';

type UpdateStatusParam = Partial<{
	gamble: Partial<{
		curTime: number;
		curCondition: number;
		conditionPeriod: number;
		conditionRatioPerList: Array<number>;
	}>;
	user: {
		grantMoney: number;
	};
}>;

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
	updateStatus(statusInfo: UpdateStatusParam): Promise<void>;
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

Status.statics.updateStatus = async function (statusInfo: UpdateStatusParam) {
	if (Object.keys(statusInfo).length === 0) {
		throw Error('아무 옵션도 없습니다.');
	}
	await this.findOneAndUpdate({}, { $set: statusInfo });
};

export default model<IStatus, IStatusStatics>('Status', Status);
