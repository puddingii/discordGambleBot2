import { IStockStatics } from '../../model/Stock';
import { IUserStatics } from '../../model/User';
import { IWeaponStatics } from '../../model/Weapon';
import { IUser, TUserGiftInfo } from '../game/user';

export type TUserParam = Partial<{ discordId: string; nickname: string }>;

export interface IUserService {
	userModel: IUserStatics;
	stockModel: IStockStatics;
	weaponModel: IWeaponStatics;
	addUser(userInfo: { id: string; nickname: string }): Promise<void>;
	addGift(userParam: TUserParam, giftInfo: TUserGiftInfo): Promise<void>;
	getUser(
		userParam: TUserParam,
		populatedList?: Array<'stockList.stock' | 'weaponList.weapon'>,
	): Promise<IUser>;
	tradeStock(user: IUser, stockName: string, cnt: number, isFull: boolean): Promise<void>;
	updateMoney(
		user: IUser,
		money: number,
		type?: 'stock' | 'coin' | 'weapon',
	): Promise<void>;
}

export default {};
