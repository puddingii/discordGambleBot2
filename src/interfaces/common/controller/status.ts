import { IStatusService, TGambleStatus } from '../../services/statusService';

export interface IStatusController {
	statusService: IStatusService;
	/** 모인 보조금 확인 */
	getGrantMoney(): Promise<number>;
	/** 도박 컨텐츠 게임 상태값들 가져오기 */
	getGambleStatus(): Promise<{
		curCondition: number;
		conditionPeriod: number;
		conditionRatioPerList: Array<number>;
	}>;
	/** 다음 컨디션 업데이트까지 남은시간 */
	getNextUpdateTime(): Promise<number>;
	/** 도박 컨텐츠 게임 상태값들 셋팅 */
	setGambleStatus(status: Partial<TGambleStatus>): Promise<void>;
	/** 보조금 업데이트 */
	updateGrantMoney(value?: number): Promise<void>;
	/** 게임내 시간 변경 */
	updateCurTime(value: number): Promise<void>;
	/** 컨디션 랜덤 업데이트 */
	updateCondition(): Promise<void>;
}
