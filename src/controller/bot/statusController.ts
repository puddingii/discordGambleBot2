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
	await globalManager.update({ type: 'g', updateParam: { num: value } });
};

export const giveGrantMoney = async (user: User) => {
	const globalManager = dataManager.get('globalStatus');
	const userManager = dataManager.get('user');
	const money = getGrantMoney();
	user.updateMoney(money);

	await dataManager.setTransaction();
	const session = dataManager.getSession();
	session?.withTransaction(async () => {
		await userManager.update(
			{ type: 'm', userInfo: { discordId: user.getId() } },
			session,
		);
		await globalManager.update({ type: 'g', updateParam: { num: 0 } });
	});
	return money;
};

export const updateCurTime = async (value?: number) => {
	const globalManager = dataManager.get('globalStatus');
	await globalManager.updateCurTime(value);
};

export default {
	getCurTime,
	getGrantMoney,
	giveGrantMoney,
	updateGrantMoney,
	updateCurTime,
};
