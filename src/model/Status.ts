import { Schema, Model, model, Types, HydratedDocument, Document } from 'mongoose';

type UpdateStatusParam = {
	gamble: Partial<{
		curTime: number;
		curCondition: number;
		conditionPeriod: number;
		conditionRatioPerList: Array<number>;
	}>;
	user: {
		grantMoney: number;
	};
};

interface DoucmentResult<T> {
	_doc: T;
}

interface IStatus extends Document, DoucmentResult<IStatus> {
	isTest: boolean;
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
	getStatus(isTest?: boolean): Promise<HydratedDocument<IStatus, IStatusStatics>>;
	updateStatus(statusInfo: Partial<UpdateStatusParam>, isTest?: boolean): Promise<void>;
}

const Status = new Schema<IStatus, IStatusStatics>({
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

Status.statics.getStatus = async function (isTest = false) {
	let status = await this.findOne({ isTest });
	if (!status) {
		status = await this.create({ isTest });
	}
	return status;
};

Status.statics.updateStatus = async function (
	statusInfo: Partial<UpdateStatusParam>,
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
				if (options[option]) {
					updInfo[`${statusType}.${option}`] = options[option];
				}
			});
		}
	});

	await this.findOneAndUpdate({ isTest }, { $set: updInfo }, { upsert: true });
};

export default model<IStatus, IStatusStatics>('Status', Status);
