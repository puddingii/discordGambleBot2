import { Schema, Model, model, Types, Document } from 'mongoose';

type TGambleStatus = {
	/** 게임 내 시간 */
	curTime: number;
	/** 현재 주식 흐름 */
	curCondition: number;
	/** 주식 흐름 바뀌는 주기 */
	conditionPeriod: number;
	/** 주식 흐름 바뀌는 확률 */
	conditionRatioPerList: Array<number>;
};

type TUserStatus = {
	/** 보조 지원금 */
	grantMoney: number;
};

export type TUpdateStatusParam = Partial<{
	gamble: Partial<TGambleStatus>;
	user: Partial<TUserStatus>;
}>;

interface DoucmentResult<T> {
	_doc: T;
}

interface IStatusModel extends Document, DoucmentResult<IStatusModel> {
	isTest: boolean;
	user: TUserStatus;
	gamble: TGambleStatus;
}

export type IStatusModelInfo = IStatusModel & {
	_id: Types.ObjectId;
};

export interface IStatusModelStatics extends Model<IStatusModel> {
	/** 상태정보 가져오기 */
	getStatus(isTest?: boolean): Promise<IStatusModelInfo>;
	/** 현재 게임시간 업데이트 */
	updateCurTime(cnt: number, isTest?: boolean): Promise<void>;
	/** 상태정보 업데이트 */
	updateStatus(statusInfo: TUpdateStatusParam, isTest?: boolean): Promise<void>;
}

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
