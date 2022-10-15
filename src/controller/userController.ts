import { UserFlagsBitField } from 'discord.js';
import User from '../game/User/User';
import DataManager from '../game/DataManager';

const dataManager = DataManager.getInstance();
const userManager = dataManager.get('user');

export const giveMoney = (
	myInfo: Partial<{ discordId: string; nickname: string }>,
	ptrInfo: Partial<{ discordId: string; nickname: string }>,
	money: number,
) => {
	const user = userManager.getUser(myInfo);
	const ptrUser = userManager.getUser(ptrInfo);
	if (!user || !ptrUser) {
		throw Error('유저정보가 없습니다.');
	}

	user.updateMoney(money * -1);
	ptrUser.updateMoney(money);
};

export const getMinUser = (): User => {
	const userList = userManager.getUserList();

	const getTotalMoney = (info: User) =>
		info.stockList.reduce((acc, cur) => {
			acc += cur.cnt * cur.stock.value;
			return acc;
		}, 0) + info.money;

	const minUser = userList.reduce((minUser, user) => {
		const afterMoney = getTotalMoney(user);
		const beforeMoney = getTotalMoney(minUser);

		return afterMoney - beforeMoney > 0 ? minUser : user;
	}, userList[0]);

	return minUser;
};

export const getUser = (info: Partial<{ discordId: string; nickname: string }>): User => {
	const user = userManager.getUser(info);
	if (!user) {
		throw Error('유저정보가 없습니다');
	}
	return user;
};

export const getUserList = () => {
	return userManager.getUserList();
};

/** 주식 + 내돈 합친 값 */
export const getRankingList = () => {
	const userList = getUserList();
	const rankingList = userList.map(user => {
		const money =
			user.stockList.reduce((acc, cur) => {
				acc += cur.cnt * cur.stock.value;
				return acc;
			}, 0) + user.money;
		return {
			name: user.nickname,
			money,
			sword: user.getWeapon('sword')?.curPower ?? 0,
		};
	});

	return rankingList;
};

export default {
	getMinUser,
	getUser,
	giveMoney,
	getRankingList,
};
