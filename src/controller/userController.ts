import UserModel from '../model/User';
import { container } from '../settings/container';
import TYPES from '../interfaces/containerType';
import {
	IUserService,
	TPopulatedList,
	TUserParam,
} from '../interfaces/services/userService';
import { IStockService } from '../interfaces/services/stockService';
import { IStock2 } from '../interfaces/game/stock';
import { IWeaponService } from '../interfaces/services/weaponService';
import { IWeapon } from '../interfaces/game/weapon';
import { IStatusService } from '../interfaces/services/statusService';

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
export const tradeStock = async ({
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

	const result = await userService.tradeStock(user, stock, cnt, isFull);
	return result;
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
}) => {
	const userService = container.get<IUserService>(TYPES.UserService);
	const weaponService = container.get<IWeaponService>(TYPES.WeaponService);
	const user = await userService.getUser({ discordId }, ['weaponList.weapon']);
	const myWeapon = user.getWeapon(type);
	if (!myWeapon) {
		throw Error('해당 무기를 가지고있지 않습니다');
	}

	const beforePower = myWeapon.curPower;
	const enhanceResult = weaponService.simulateWeaponEnhance(
		<IWeapon>myWeapon.weapon,
		myWeapon.curPower,
	);
	await userService.updateWeaponAndUserMoney(user, myWeapon, enhanceResult, {
		isPreventDestroy,
		isPreventDown,
	});

	return { code: enhanceResult.code, curPower: myWeapon.curPower, beforePower };
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
	await userService.addGift(receiver, {
		type: 'money',
		value: money,
		comment: `${sender.nickname}이 보냄`,
	});
};

/** 유저정보 반환 */
export const getUser = async (info: TUserParam, populatedList?: TPopulatedList) => {
	const userService = container.get<IUserService>(TYPES.UserService);
	const user = await userService.getUser(info, populatedList);

	return user;
};

/** 내 특정 무기 가져오기 */
export const getMyWeapon = async (discordId: string, type: string) => {
	const userService = container.get<IUserService>(TYPES.UserService);
	const user = await userService.getUser({ discordId }, ['weaponList.weapon']);

	return user.getWeapon(type);
};

/** 내 무기 강화에 필요한 정보 가져오기 */
export const getMyWeaponEnhanceInfo = async (discordId: string, type: string) => {
	const userService = container.get<IUserService>(TYPES.UserService);
	const weaponService = container.get<IWeaponService>(TYPES.WeaponService);
	const user = await userService.getUser({ discordId }, ['weaponList.weapon']);
	const myWeapon = user.getWeapon(type);
	if (!myWeapon) {
		throw Error('해당하는 무기를 가지고 있지 않습니다');
	}
	const enhanceInfo = weaponService.getEnhanceInfo(myWeapon.weapon, myWeapon.curPower);
	return enhanceInfo;
};

/** 내 무기들 가져오기 */
export const getMyWeaponList = async (discordId: string) => {
	const userService = container.get<IUserService>(TYPES.UserService);
	const user = await userService.getUser({ discordId }, ['weaponList.weapon']);

	return user.weaponList;
};

/** 게임에 참여하는 유저리스트 반환 */
export const getUserList = async (populatedList?: TPopulatedList) => {
	const userService = container.get<IUserService>(TYPES.UserService);
	const userList = await userService.getAllUser(populatedList);
	return userList;
};

/** 내가 1개 이상 가지고 있는 주식리스트 */
export const getMyStockList = async (discordId: string) => {
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

/** 보조금 유저에게 지급 */
export const giveGrantMoney = async (discordId: string) => {
	const userService = container.get<IUserService>(TYPES.UserService);
	const statusService = container.get<IStatusService>(TYPES.StatusService);
	const user = await userService.getUser({ discordId });
	const { grantMoney } = await statusService.getUserStatus();
	await userService.updateMoney(user, grantMoney);
	await statusService.setUserStatus({ grantMoney: 0 });

	return grantMoney;
};

/** FIXME 패스워드 (재)생성 */
export const generatePassword = async (discordId: string) => {
	const myPassword = await UserModel.generatePassword(discordId);
	return myPassword;
};

export default {
	addUser,
	adjustMoney,
	tradeStock,
	enhanceWeapon,
	getUser,
	getUserList,
	giveMoney,
	giveGrantMoney,
	getRankingList,
	getMyStockList,
	getMyWeapon,
	getMyWeaponEnhanceInfo,
	getMyWeaponList,
	generatePassword,
	updateMoney,
};
