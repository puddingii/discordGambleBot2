import DataManager from '../game/DataManager';

const dataManager = DataManager.getInstance();

export const getCurTime = () => {
	const globalManager = dataManager.get('globalStatus');
	return globalManager.curTime;
};

export const getGrantMoney = () => {
	const globalManager = dataManager.get('globalStatus');
	return globalManager.grantMoney;
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
	updateGrantMoney,
	updateCurTime,
};
