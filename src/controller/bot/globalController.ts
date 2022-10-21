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

export const giveGrantMoney = (user: User, money: number) => {
	const userManager = dataManager.get('user');
	user.updateMoney(money);
	userManager.pushWaitingUser(user);
};

export const updateGrantMoney = (value: number) => {
	const globalManager = dataManager.get('globalStatus');
	globalManager.grantMoney = value;
};

export const updateCurTime = (value: number) => {
	const globalManager = dataManager.get('globalStatus');
	globalManager.curTime = value;
};

export default {
	getCurTime,
	getGrantMoney,
	giveGrantMoney,
	updateGrantMoney,
	updateCurTime,
};
