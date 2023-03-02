import { IStatusModelStatics } from '../../common/model/Status';
import { IFormatter } from '../../common/util/formatter';

export type TUserStatus = { grantMoney: number };
export type TGambleStatus = {
	curTime: number;
	curCondition: number;
	conditionPeriod: number;
	conditionRatioPerList: Array<number>;
};
export type TTotalStatus = {
	user: TUserStatus;
	gamble: TGambleStatus;
};

export interface IStatusService {
	statusModel: IStatusModelStatics;
	formatter: IFormatter;
	getUserStatus(isTest?: boolean): Promise<TUserStatus>;
	getGambleStatus(isTest?: boolean): Promise<TGambleStatus>;
	getTotalStatus(isTest?: boolean): Promise<TTotalStatus>;
	getRandomCondition(statusInfo: TGambleStatus): number;
	updateCurTime(cnt: number, isTest?: boolean): Promise<void>;
	/** 보조금 업데이트 */
	updateGrantMoney(grantMoney: number, num?: number): Promise<void>;
	setGambleStatus(statusInfo: Partial<TGambleStatus>, isTest?: boolean): Promise<void>;
	setUserStatus(statusInfo: Partial<TUserStatus>, isTest?: boolean): Promise<void>;
	setTotalStatus(statusInfo: Partial<TTotalStatus>, isTest?: boolean): Promise<void>;
}
