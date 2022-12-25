import { Schema, Model, model, Types, Document, ClientSession } from 'mongoose';

type UpdateStatusParam = {
	gamble: Partial<{
		/** 게임 내 시간 */
		curTime: number;
		/** 현재 주식 흐름 */
		curCondition: number;
		/** 주식 흐름 바뀌는 주기 */
		conditionPeriod: number;
		/** 주식 흐름 바뀌는 확률 */
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

export type IStatusInfo = IStatus & {
	_id: Types.ObjectId;
};

interface IStatusStatics extends Model<IStatus> {
	getStatus(isTest?: boolean): Promise<IStatusInfo>;
	updateStatus(
		statusInfo: Partial<UpdateStatusParam>,
		session?: ClientSession | null,
		isTest?: boolean,
	): Promise<void>;
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
	session: ClientSession | null = null,
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

	await this.findOneAndUpdate({ isTest }, { $set: updInfo }, { upsert: true }).session(
		session,
	);
};

export default model<IStatus, IStatusStatics>('Status', Status);
