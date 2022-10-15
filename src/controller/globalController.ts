import DataManager from '../game/DataManager';

const dataManager = DataManager.getInstance();
const globalManager = dataManager.get('globalStatus');

export const getCurTime = () => {
	return globalManager.curTime;
};

export const getGrantMoney = () => {
	return globalManager.grantMoney;
};

export const updateGrantMoney = (value: number) => {
	globalManager.grantMoney = value;
};

export const updateCurTime = (value: number) => {
	globalManager.curTime = value;
};

export default {
	getCurTime,
	getGrantMoney,
	updateGrantMoney,
	updateCurTime,
};
