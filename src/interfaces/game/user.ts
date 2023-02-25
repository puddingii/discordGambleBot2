import { Types } from 'mongoose';
import Coin from '../../game/Stock/Coin';
import { IStock2 } from './stock';
import { IWeapon } from './weapon';

/** 유저가 가지고 있는 주식정보 타입 */
export type TUserStockInfo = {
	stock: IStock2 | Coin | Types.ObjectId;
	cnt: number;
	value: number;
};

/** 유저가 가지고 있는 무기정보 */
export type TUserWeaponInfo = {
	weapon: IWeapon | Types.ObjectId;
	destroyCnt: number;
	failCnt: number;
	successCnt: number;
	curPower: number;
	bonusPower: number;
	hitRatio: number;
	missRatio: number;
};

export type TPopulatedUserWeaponInfo = Omit<TUserWeaponInfo, 'weapon'> & {
	weapon: IWeapon;
};

export type TUserGiftInfo = {
	type: string;
	value: number;
	comment: string;
};

export interface IUserInfo {
	id: string;
	nickname: string;
	money: number;
	stockList: Array<TUserStockInfo>;
	weaponList: Array<TUserWeaponInfo>;
	giftList: Array<TUserGiftInfo>;
}

export type TUserConstructor = Pick<IUserInfo, 'id' | 'nickname'> &
	Omit<Partial<IUserInfo>, 'id' | 'nickname'>;

/** 유저가 가지고 있는 Stock 업데이트 할 때 사용하는 함수리턴 타입 */
export type TUpdateStockResult = { cnt: number; value: number; money: number };

export interface IUser extends Omit<IUserInfo, 'id'> {
	/** 받은 선물 추가 */
	addGift(giftInfo: TUserGiftInfo): void;
	/** type에 해당하는 모든 선물 지우기 */
	deleteAllGift(type: string): void;
	/** type과 value에 해당하는 선물정보 지우기.(순서 상관없음) */
	deleteGift({ type, value }: TUserGiftInfo): void;
	/** 유저 디스코드 아이디 가져오기 */
	getId(): string;
	/** 가지고 있는 name에 해당하는 주식 가져오기 */
	getStock(name: string): TUserStockInfo | undefined;
	/** 가지고 있는 무기 가져오기 */
	getWeapon(type: string): TPopulatedUserWeaponInfo | undefined;
}
