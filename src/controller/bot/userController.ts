import _ from 'lodash';
import User from '../../game/User/User';
import DataManager from '../../game/DataManager';

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

type EnhanceWeaponType = {
	/** 1: 성공, 2: 실패, 3: 터짐 */
	code: 1 | 2 | 3;
	curPower: number;
	beforePower: number;
};

/** 신규유저 추가 */
export const addUser = async (userInfo: { id: string; nickname: string }) => {
	const userManager = dataManager.get('user');
	await userManager.addUser(userInfo);
};

/** 유저머니 조정. */
export const adjustMoney = async (
	userInfo: Partial<{ discordId: string; nickname: string }>,
	money: number,
) => {
	const userManager = dataManager.get('user');
	const user = userManager.getUser(userInfo);
	if (!user) {
		throw Error('유저정보가 없습니다.');
	}
	user.updateMoney(money);
	await userManager.update({ type: 'm', userInfo: { discordId: user.getId() } });
};

/** 주식사기 */
export const buySellStock = async ({
	discordId,
	stockName,
	cnt,
	isFull,
}: {
	discordId: string;
	stockName: string;
	cnt: number;
	isFull: boolean;
}): Promise<{ cnt: number; value: number; money: number }> => {
	const userManager = dataManager.get('user');
	const stockManager = dataManager.get('stock');
	const userInfo = dataManager.get('user').getUser({ discordId });
	if (!userInfo) {
		throw Error('유저정보가 없습니다');
	}

	const stockInfo = stockManager.getStock('', stockName);
	if (!stockInfo) {
		throw Error('주식/코인정보가 없습니다');
	}

	const stockResult = userInfo.updateStock(stockInfo, cnt, isFull);
	await userManager.update({
		type: 'sm',
		userInfo,
		optionalInfo: {
			name: stockInfo.name,
			cnt: stockResult.cnt,
			value: stockResult.value,
		},
	});
	return stockResult;
};

/** 무기강화 */
export const enhanceWeapon = async ({
	discordId,
	type,
	isPreventDestroy = false,
	isPreventDown = false,
}: {
	discordId: string;
	type: string;
	isPreventDestroy: boolean;
	isPreventDown: boolean;
}): Promise<EnhanceWeaponType> => {
	const userManager = dataManager.get('user');
	const weaponManager = dataManager.get('weapon');
	const weaponInfo = weaponManager.getInfo({ type });
	const userInfo = userManager.getUser({ discordId });
	if (!userInfo) {
		throw Error('유저정보가 없습니다');
	}

	const myWeapon = userInfo.weaponList.find(weapon => weapon.weapon.type === type);
	if (!myWeapon) {
		throw Error('무기정보가 없습니다.');
	}

	const beforePower = myWeapon.curPower;

	/** 강화진행 */
	const enhanceResult = weaponManager.enhanceWeapon(weaponInfo, beforePower, {
		isPreventDestroy,
		isPreventDown,
	});
	const code = enhanceResult.code ?? 2;
	delete enhanceResult.code;
	userManager.updateWeapon(myWeapon, enhanceResult);

	// 강화비용 계산
	const cost = weaponInfo.getCost(beforePower, {
		isPreventDestroy,
		isPreventDown,
	});
	userInfo.updateMoney(-1 * cost, 'weapon');

	await userManager.update({ type: 'wm', userInfo, optionalInfo: myWeapon });
	return { code, curPower: enhanceResult.curPower, beforePower };
};

/** 다른 사람한테 돈 기부 */
export const giveMoney = async (
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
	await dataManager.setTransaction();
	const session = dataManager.getSession();
	await session?.withTransaction(async () => {
		await userManager.update({ type: 'm', userInfo: myInfo }, session);
		await userManager.update({ type: 'm', userInfo: ptrInfo }, session);
	});
	await dataManager.setTransaction(true);
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
		};
	});

	return rankingList;
};

/** 돈 갱신 */
export const updateMoney = async (discordId: string, value: number): Promise<User> => {
	const userManager = dataManager.get('user');
	const userInfo = dataManager.get('user').getUser({ discordId });
	if (!userInfo) {
		throw Error('유저정보가 없습니다');
	}
	userInfo.updateMoney(value);
	await userManager.update({ type: 'm', userInfo });
	return userInfo;
};

/** 패스워드 (재)생성 */
export const generatePassword = async (discordId: string) => {
	const userManager = dataManager.get('user');
	const myPassword = await userManager.generatePassword(discordId);
	return myPassword;
};

export default {
	addUser,
	adjustMoney,
	buySellStock,
	enhanceWeapon,
	getMinUser,
	getUser,
	giveMoney,
	getRankingList,
	getMyStockList,
	generatePassword,
	updateMoney,
};
