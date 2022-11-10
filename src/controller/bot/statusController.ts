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
	const beforeMoney = globalManager.grantMoney;
	globalManager.updateGrantMoney(value);

	try {
		await globalManager.update({ type: 'g' });
	} catch (e) {
		let errorMessage = e;
		globalManager.updateGrantMoney(beforeMoney);

		if (typeof errorMessage !== 'string') {
			errorMessage = '보조금 업데이트 실패';
		}

		throw Error(<string>errorMessage);
	}
};

export const giveGrantMoney = async (user: User) => {
	const globalManager = dataManager.get('globalStatus');
	const userManager = dataManager.get('user');
	const money = globalManager.grantMoney;
	user.updateMoney(money);
	globalManager.updateGrantMoney(0);

	try {
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
	} catch (e) {
		let errorMessage = e;
		user.updateMoney(-1 * money);
		globalManager.updateGrantMoney(money);

		if (typeof errorMessage !== 'string') {
			errorMessage = '보조금 받기 실패';
		}

		throw Error(<string>errorMessage);
	}
};

export const updateCurTime = async (value: number) => {
	const globalManager = dataManager.get('globalStatus');
	globalManager.updateCurTime(value);

	try {
		await globalManager.update({ type: 't' });
	} catch (e) {
		let errorMessage = e;
		globalManager.updateCurTime(-1 * value);

		if (typeof errorMessage !== 'string') {
			errorMessage = '시간 업데이트 실패';
		}

		throw Error(<string>errorMessage);
	}
};

export default {
	getCurTime,
	getGrantMoney,
	giveGrantMoney,
	updateGrantMoney,
	updateCurTime,
};
