import UserModel from '../../model/User';
import DataManager from '../../game/DataManager';
import { container } from '../../settings/container';
import TYPES from '../../interfaces/containerType';
import { IUserService, TUserParam } from '../../interfaces/services/userService';
import { IStockService } from '../../interfaces/services/stockService';
import { IStock2 } from '../../interfaces/game/stock';

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
	const userService = container.get<IUserService>(TYPES.UserService);
	await userService.addUser(userInfo);
};

/** 유저머니 조정. */
export const adjustMoney = async (userParam: TUserParam, money: number) => {
	const userService = container.get<IUserService>(TYPES.UserService);
	const user = await userService.getUser(userParam);

	await userService.updateMoney(user, money);
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
}) => {
	const userService = container.get<IUserService>(TYPES.UserService);
	const stockService = container.get<IStockService>(TYPES.StockService);
	const user = await userService.getUser({ discordId }, ['stockList.stock']);
	const stock = await stockService.getStock(stockName);

	await userService.tradeStock(user, stock, cnt, isFull);
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

	await UserModel.updateWeaponAndMoney(userInfo.getId(), myWeapon, userInfo.money);
	return { code, curPower: enhanceResult.curPower, beforePower };
};

/** 다른 사람한테 돈 기부 */
export const giveMoney = async (
	myInfo: TUserParam,
	ptrInfo: TUserParam,
	money: number,
) => {
	const userService = container.get<IUserService>(TYPES.UserService);
	/** 회원 데이터 있는지 확인 */
	const sender = await userService.getUser(myInfo);
	const receiver = await userService.getUser(ptrInfo);

	/** 보낸 사람은 돈 차감, 받는 사람은 선물목록에 추가 */
	await userService.updateMoney(sender, money * -1);
	await userService.addGift(receiver, { type: 'money', value: money });
};

/** 유저정보 반환 */
export const getUser = async (info: TUserParam) => {
	const userService = container.get<IUserService>(TYPES.UserService);
	const user = await userService.getUser(info);

	return user;
};

/** 게임에 참여하는 유저리스트 반환 */
export const getUserList = async (
	populatedList?: Array<'stockList.stock' | 'weaponList.weapon'>,
) => {
	const userService = container.get<IUserService>(TYPES.UserService);
	const userList = await userService.getAllUser(populatedList);
	return userList;
};

/** 내가 1개 이상 가지고 있는 주식리스트 */
export const getMyStockList = async (discordId: string): Promise<MyStockInfo> => {
	const userService = container.get<IUserService>(TYPES.UserService);
	const user = await userService.getUser({ discordId }, ['stockList.stock']);
	const stockInfo = userService.getProcessedStock(user);

	return stockInfo;
};

/** 주식 + 내돈 합친 값 */
export const getRankingList = async () => {
	const userList = await getUserList(['stockList.stock']);
	const rankingList = userList.map(user => {
		const money =
			user.stockList.reduce((acc, cur) => {
				acc += cur.cnt * (<IStock2>cur.stock).value;
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
export const updateMoney = async (discordId: string, value: number) => {
	const userService = container.get<IUserService>(TYPES.UserService);
	const user = await userService.getUser({ discordId });
	await userService.updateMoney(user, value);

	return user;
};

/** 패스워드 (재)생성 */
export const generatePassword = async (discordId: string) => {
	const myPassword = await UserModel.generatePassword(discordId);
	return myPassword;
};

export default {
	addUser,
	adjustMoney,
	buySellStock,
	enhanceWeapon,
	getUser,
	giveMoney,
	getRankingList,
	getMyStockList,
	generatePassword,
	updateMoney,
};
