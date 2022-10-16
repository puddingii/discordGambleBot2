import _ from 'lodash';
import User from '../game/User/User';
import DataManager from '../game/DataManager';

const dataManager = DataManager.getInstance();

interface MyStockInfo {
	stockList: Array<{
		name: string;
		cnt: number;
		myRatio: number;
		myValue: number;
		stockValue: number;
		stockType: 'stock' | 'coin';
		stockBeforeRatio: number;
		profilMargin: number;
	}>;
	totalMyValue: number;
	totalStockValue: number;
}

/** 신규유저 추가 */
export const addUser = (userInfo: { id: string; nickname: string }) => {
	const userManager = dataManager.get('user');
	userManager.addUser(userInfo);
};

/** 다른 사람한테 돈 기부 */
export const giveMoney = (
	myInfo: Partial<{ discordId: string; nickname: string }>,
	ptrInfo: Partial<{ discordId: string; nickname: string }>,
	money: number,
) => {
	const userManager = dataManager.get('user');
	const user = userManager.getUser(myInfo);
	const ptrUser = userManager.getUser(ptrInfo);
	if (!user || !ptrUser) {
		throw Error('유저정보가 없습니다.');
	}

	user.updateMoney(money * -1);
	ptrUser.updateMoney(money);
};

/** 주식 + 내돈을 합쳐서 젤 적은사람 반환 */
export const getMinUser = (): User => {
	const userManager = dataManager.get('user');
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

/** 유저정보 반환 */
export const getUser = (info: Partial<{ discordId: string; nickname: string }>): User => {
	const userManager = dataManager.get('user');
	const user = userManager.getUser(info);
	if (!user) {
		throw Error('유저정보가 없습니다');
	}
	return user;
};

/** 게임에 참여하는 유저리스트 반환 */
export const getUserList = () => {
	const userManager = dataManager.get('user');
	return userManager.getUserList();
};

/** 내가 가지고 있는 주식리스트 */
export const getMyStockList = (discordId: string): MyStockInfo => {
	const user = getUser({ discordId });

	const stockInfo = user.stockList.reduce(
		(acc: MyStockInfo, myStock) => {
			if (myStock.cnt > 0) {
				const myRatio = _.round((myStock.stock.value / myStock.value) * 100 - 100, 2);
				acc.totalMyValue += myStock.cnt * myStock.value;
				acc.totalStockValue += myStock.cnt * myStock.stock.value;
				acc.stockList.push({
					name: myStock.stock.name,
					cnt: myStock.cnt,
					myValue: myStock.value,
					myRatio,
					stockValue: myStock.stock.value,
					stockType: myStock.stock.type,
					stockBeforeRatio: _.round(myStock.stock.beforeHistoryRatio * 100, 2),
					profilMargin: myStock.cnt * (myStock.stock.value - myStock.value),
				});
			}
			return acc;
		},
		{ stockList: [], totalMyValue: 0, totalStockValue: 0 },
	);

	return stockInfo;
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
	addUser,
	getMinUser,
	getUser,
	giveMoney,
	getRankingList,
	getMyStockList,
};
