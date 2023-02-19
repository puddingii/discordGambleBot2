import DataManager from '../../game/DataManager';
import UserModel from '../../model/User';
import StatusModel from '../../model/Status';
import User from '../../game/User/User';

const dataManager = DataManager.getInstance();

export const getCurTime = () => {
	const globalManager = dataManager.get('globalStatus');
	return globalManager.curTime;
};

export const getGrantMoney = () => {
	const globalManager = dataManager.get('globalStatus');
	return globalManager.grantMoney;
};

export const updateGrantMoney = async (value?: number) => {
	const globalManager = dataManager.get('globalStatus');
	globalManager.updateGrantMoney(value);
	await StatusModel.updateStatus({ user: { grantMoney: globalManager.grantMoney } });
};

export const giveGrantMoney = async (user: User) => {
	const globalManager = dataManager.get('globalStatus');
	const money = getGrantMoney();
	user.updateMoney(money);
	globalManager.updateGrantMoney(0);

	await dataManager.setTransaction();
	const session = dataManager.getSession();
	await session?.withTransaction(async () => {
		await UserModel.updateMoney({ discordId: user.getId() }, user.money, session);
		await StatusModel.updateStatus({ user: { grantMoney: globalManager.grantMoney } });
	});
	await dataManager.setTransaction(true);
	return money;
};

export const updateCurTime = async (value: number) => {
	const globalManager = dataManager.get('globalStatus');
	globalManager.updateCurTime(value);
	await StatusModel.updateStatus({ gamble: { curTime: globalManager.curTime } });
};

export default {
	getCurTime,
	getGrantMoney,
	giveGrantMoney,
	updateGrantMoney,
	updateCurTime,
};
