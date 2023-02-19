import { IStockStatics } from '../../model/Stock';
import { IUserStatics } from '../../model/User';
import { IWeaponStatics } from '../../model/Weapon';
import { IStock2 } from '../game/stock';
import { IUser, TUserGiftInfo } from '../game/user';

export type TUserParam = Partial<{ discordId: string; nickname: string }>;
export type TProcessedStockInfo = {
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
};
export interface IUserService {
	userModel: IUserStatics;
	stockModel: IStockStatics;
	weaponModel: IWeaponStatics;
	/** 유저 추가 */
	addUser(userInfo: { id: string; nickname: string }): Promise<void>;
	/** 유저에게 선물주기 */
	addGift(user: IUser, giftInfo: TUserGiftInfo): Promise<void>;
	/** 특정 유저 가져오기 */
	getUser(
		userParam: TUserParam,
		populatedList?: Array<'stockList.stock' | 'weaponList.weapon'>,
	): Promise<IUser>;
	/** 모든 유저리스트 가져오기 */
	getAllUser(
		populatedList?: Array<'stockList.stock' | 'weaponList.weapon'>,
	): Promise<Array<IUser>>;
	/** 1개 이상 가지고 있는 주식정보를 가공 */
	getProcessedStock(user: IUser): TProcessedStockInfo;
	/** 주식 거래 */
	tradeStock(user: IUser, stock: IStock2, cnt: number, isFull: boolean): Promise<void>;
	/** 가지고 있는 돈 업데이트 */
	updateMoney(
		user: IUser,
		money: number,
		type?: 'stock' | 'coin' | 'weapon',
	): Promise<void>;
}

export default {};
