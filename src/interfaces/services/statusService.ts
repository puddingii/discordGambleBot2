import { IStatusStatics } from '../../model/Status';
import { IFormatter } from '../../util/formatter';

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
	statusModel: IStatusStatics;
	formatter: IFormatter;
	getUserStatus(isTest?: boolean): Promise<TUserStatus>;
	getGambleStatus(isTest?: boolean): Promise<TGambleStatus>;
	getTotalStatus(isTest?: boolean): Promise<TTotalStatus>;
	getRandomCondition(statusInfo: TGambleStatus): number;
	setGambleStatus(statusInfo: Partial<TGambleStatus>, isTest?: boolean): Promise<void>;
	setUserStatus(statusInfo: Partial<TUserStatus>, isTest?: boolean): Promise<void>;
	setTotalStatus(statusInfo: Partial<TTotalStatus>, isTest?: boolean): Promise<void>;
}
