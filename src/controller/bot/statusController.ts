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
	await globalManager.updateGrantMoney(value);
};

export const giveGrantMoney = async (user: User) => {
	const userManager = dataManager.get('user');
	const money = getGrantMoney();
	user.updateMoney(money);
	await userManager.update({ type: 'm', userInfo: { discordId: user.getId() } });
	await updateGrantMoney(0);
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
