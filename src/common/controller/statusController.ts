import { inject, injectable } from 'inversify';
import TYPES from '../../interfaces/containerType';
import { IStatusController } from '../../interfaces/common/controller/status';

@injectable()
export default class StatusController implements IStatusController {
	statusService: IStatusController['statusService'];

	constructor(
		@inject(TYPES.StatusService) statusService: IStatusController['statusService'],
	) {
		this.statusService = statusService;
	}

	async getGrantMoney() {
		const { grantMoney } = await this.statusService.getUserStatus();
		return grantMoney;
	}

	async updateCurTime(value: number) {
		await this.statusService.updateCurTime(value);
	}

	async updateGrantMoney(value?: number | undefined) {
		const { grantMoney } = await this.statusService.getUserStatus();
		await this.statusService.updateGrantMoney(grantMoney, value);
	}
}
