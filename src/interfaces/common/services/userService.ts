import { IUserStatics } from '../../../common/model/User';
import {
	IUser,
	TPopulatedUserStockInfo,
	TPopulatedUserWeaponInfo,
	TUserGiftInfo,
} from '../../game/user';
import { IWeapon } from '../../game/weapon';
import { TEnhanceSimulateResult } from './weaponService';

export type TPopulatedList = Array<'stockList.stock' | 'weaponList.weapon'>;

export type TUserParam = Partial<{ discordId: string; nickname: string }>;
export type TProcessedStockInfo = {
	stockList: Array<{
		name: string;
		cnt: number;
		myRatio: number;
		myValue: number;
		stockValue: number;
		stockType: 'stock' | 'coin';
		profilMargin: number;
		holdingRatio: number;
	}>;
	totalMyValue: number;
	totalStockValue: number;
	totalMyMoney: number;
};
export interface IUserService {
	userModel: IUserStatics;
	/** 유저 추가 */
	addUser(userInfo: { id: string; nickname: string }): Promise<void>;
	/** 유저에게 선물주기 */
	addGift(user: IUser, giftInfo: TUserGiftInfo): Promise<void>;
	/** 유저에게 선물주기 */
	addGiftList(user: IUser, giftList: Array<TUserGiftInfo>): Promise<void>;
	/** 유저에게 무기추가 */
	addWeapon(weapon: IWeapon): Promise<void>;
	/** 유저에게 주식추가 */
	addStock(stock: TPopulatedUserStockInfo['stock']): Promise<void>;
	/** 무기 업데이트 및 돈 저장 */
	updateWeaponAndUserMoney(
		user: IUser,
		myWeapon: TPopulatedUserWeaponInfo,
		enhanceResult: TEnhanceSimulateResult,
		option?: Partial<{ isPreventDestroy: boolean; isPreventDown: boolean }>,
	): Promise<void>;
	/** 특정 유저 가져오기 */
	getUser(userParam: TUserParam, populatedList?: TPopulatedList): Promise<IUser>;
	/** 모든 유저리스트 가져오기 */
	getAllUser(populatedList?: TPopulatedList): Promise<Array<IUser>>;
	/** 1개 이상 가지고 있는 주식정보를 가공 */
	getProcessedStock(user: IUser): TProcessedStockInfo;
	/** 주식 거래(사고 팔때 사용) 살때는 cnt가 양수 아니면 음수 */
	tradeStock(
		user: IUser,
		stock: TPopulatedUserStockInfo['stock'],
		cnt: number,
		isFull: boolean,
	): Promise<{ cnt: number; value: number }>;
	/** 가지고 있는 돈 업데이트 */
	updateMoney(user: IUser, money: number): Promise<void>;
	/** 랜덤패스워드 생성 및 저장 */
	generatePassword(discordId: string): Promise<string>;
	/** 선물받은 돈 전부 받기 */
	receiveAllGiftMoney(userParam: TUserParam): Promise<number>;
	/** 선물받은 돈 */
	getReceivedAllGiftMoney(user: IUser): Promise<number>;
}

export default {};
