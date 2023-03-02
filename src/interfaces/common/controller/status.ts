import { IStatusService } from '../../services/statusService';

export interface IStatusController {
	statusService: IStatusService;
	/** 모인 보조금 확인 */
	getGrantMoney(): Promise<number>;
	/** 보조금 업데이트 */
	updateGrantMoney(value?: number): Promise<void>;
	/** 게임내 시간 변경 */
	updateCurTime(value: number): Promise<void>;
}
