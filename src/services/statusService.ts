import { inject, injectable } from 'inversify';
import TYPES from '../interfaces/containerType';
import {
	IStatusService,
	TGambleStatus,
	TTotalStatus,
	TUserStatus,
} from '../interfaces/services/statusService';

@injectable()
class StatusService implements IStatusService {
	formatter: IStatusService['formatter'];
	statusModel: IStatusService['statusModel'];

	constructor(
		@inject(TYPES.StatusModel) statusModel: IStatusService['statusModel'],
		@inject(TYPES.Formatter) formatter: IStatusService['formatter'],
	) {
		this.statusModel = statusModel;
		this.formatter = formatter;
	}

	getRandomCondition(statusInfo: TGambleStatus) {
		const { curTime, conditionPeriod, conditionRatioPerList } = statusInfo;

		if (curTime % conditionPeriod !== 0) {
			return -1;
		}

		const randIdx = this.formatter.getRandomNumber(100, 1);
		let perTotal = 0;
		let curCondition = 0;
		conditionRatioPerList.some((ratio, idx) => {
			if (randIdx <= ratio + perTotal) {
				curCondition = idx + 1;
				return true;
			}
			perTotal += ratio;
			return false;
		});

		return curCondition;
	}

	async getGambleStatus(isTest = false) {
		const { gamble } = await this.statusModel.getStatus(isTest);
		return gamble;
	}

	async getTotalStatus(isTest = false) {
		const totalStatus = await this.statusModel.getStatus(isTest);
		return totalStatus;
	}

	async getUserStatus(isTest = false) {
		const { user } = await this.statusModel.getStatus(isTest);
		return user;
	}

	async setGambleStatus(
		statusInfo: Partial<TGambleStatus>,
		isTest?: boolean | undefined,
	) {
		await this.statusModel.updateStatus({ gamble: statusInfo }, null, isTest);
	}

	async setTotalStatus(statusInfo: Partial<TTotalStatus>, isTest?: boolean | undefined) {
		await this.statusModel.updateStatus(statusInfo, null, isTest);
	}

	async setUserStatus(statusInfo: Partial<TUserStatus>, isTest?: boolean | undefined) {
		await this.statusModel.updateStatus({ user: statusInfo }, null, isTest);
	}
}

export default StatusService;
