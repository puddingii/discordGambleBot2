import DataManager from '../../game/DataManager';
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
	await globalManager.update({ type: 'g' });
};

export const giveGrantMoney = async (user: User) => {
	const globalManager = dataManager.get('globalStatus');
	const userManager = dataManager.get('user');
	const money = getGrantMoney();
	user.updateMoney(money);
	globalManager.updateGrantMoney(0);

	await dataManager.setTransaction();
	const session = dataManager.getSession();
	await session?.withTransaction(async () => {
		await userManager.update(
			{ type: 'm', userInfo: { discordId: user.getId() } },
			session,
		);
		await globalManager.update({ type: 'g' });
	});
	await dataManager.setTransaction(true);
	return money;
};

export const updateCurTime = async (value?: number) => {
	const globalManager = dataManager.get('globalStatus');
	globalManager.updateCurTime(value);
	await globalManager.update({ type: 't' });
};

export default {
	getCurTime,
	getGrantMoney,
	giveGrantMoney,
	updateGrantMoney,
	updateCurTime,
};
