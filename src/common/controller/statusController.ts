import { inject, injectable } from 'inversify';
import TYPES from '../../interfaces/containerType';
import { IStatusController } from '../../interfaces/common/controller/status';
import { TGambleStatus } from '../../interfaces/services/statusService';

@injectable()
export default class StatusController implements IStatusController {
	statusService: IStatusController['statusService'];

	constructor(
		@inject(TYPES.StatusService) statusService: IStatusController['statusService'],
	) {
		this.statusService = statusService;
	}

	async getGambleStatus(): Promise<{
		curCondition: number;
		conditionPeriod: number;
		conditionRatioPerList: number[];
	}> {
		const { conditionPeriod, conditionRatioPerList, curCondition } =
			await this.statusService.getGambleStatus();

		return {
			curCondition,
			conditionPeriod,
			conditionRatioPerList,
		};
	}

	async getGrantMoney() {
		const { grantMoney } = await this.statusService.getUserStatus();
		return grantMoney;
	}

	async getNextUpdateTime(): Promise<number> {
		const { conditionPeriod, curTime } = await this.statusService.getGambleStatus();
		return conditionPeriod - (curTime % conditionPeriod);
	}

	async setGambleStatus(status: Partial<TGambleStatus>): Promise<void> {
		await this.statusService.setGambleStatus(status);
	}

	async updateCondition(): Promise<void> {
		const statusInfo = await this.statusService.getGambleStatus();
		const curCondition = this.statusService.getRandomCondition(statusInfo);
		if (curCondition === -1) {
			return;
		}
		await this.statusService.setGambleStatus({ curCondition });
	}

	async updateCurTime(value: number) {
		await this.statusService.updateCurTime(value);
	}

	async updateGrantMoney(value?: number | undefined) {
		const { grantMoney } = await this.statusService.getUserStatus();
		await this.statusService.updateGrantMoney(grantMoney, value);
	}
}
