import { Model, Types } from 'mongoose';

type TGambleStatus = {
	/** 게임 내 시간. 4의 배수 */
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

export interface IStatusModel extends Document, DoucmentResult<IStatusModel> {
	isTest: boolean;
	user: TUserStatus;
	gamble: TGambleStatus;
}

export type IStatusModelResult = IStatusModel & {
	_id: Types.ObjectId;
};

export interface IStatusModelStatics extends Model<IStatusModel> {
	/** 상태정보 가져오기 */
	getStatus(isTest?: boolean): Promise<IStatusModelResult>;
	/** 현재 게임시간 업데이트 */
	updateCurTime(cnt: number, isTest?: boolean): Promise<void>;
	/** 상태정보 업데이트 */
	updateStatus(statusInfo: TUpdateStatusParam, isTest?: boolean): Promise<void>;
}
