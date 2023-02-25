import { container } from '../settings/container';
import TYPES from '../interfaces/containerType';
import { IStatusService } from '../interfaces/services/statusService';

export const getGrantMoney = async () => {
	const statusService = container.get<IStatusService>(TYPES.StatusService);
	const { grantMoney } = await statusService.getUserStatus();
	return grantMoney;
};

export const updateGrantMoney = async (value?: number) => {
	const statusService = container.get<IStatusService>(TYPES.StatusService);
	const { grantMoney } = await statusService.getUserStatus();
	await statusService.updateGrantMoney(grantMoney, value);
};

export const updateCurTime = async (value: number) => {
	const statusService = container.get<IStatusService>(TYPES.StatusService);
	await statusService.updateCurTime(value);
};

export default {
	getGrantMoney,
	updateGrantMoney,
	updateCurTime,
};
