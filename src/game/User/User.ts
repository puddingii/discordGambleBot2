import { Types } from 'mongoose';
import {
	IUser,
	IUserInfo,
	TUserGiftInfo,
	TUserConstructor,
	TPopulatedUserWeaponInfo,
} from '../../interfaces/game/user';
import { IStock2 } from '../../interfaces/game/stock';

export default class User implements IUser {
	private _id: IUserInfo['id'];
	giftList: IUserInfo['giftList'];
	money: IUserInfo['money'];
	nickname: IUserInfo['nickname'];
	stockList: IUserInfo['stockList'];
	weaponList: IUserInfo['weaponList'];

	constructor({
		id,
		nickname,
		money,
		stockList,
		weaponList,
		giftList,
	}: TUserConstructor) {
		this._id = id;
		this.nickname = nickname;
		this.money = money ?? 1000000;
		this.stockList = stockList ?? [];
		this.weaponList = weaponList ?? [];
		this.giftList = giftList ?? [];
	}

	addGift(giftInfo: TUserGiftInfo) {
		this.giftList.push(giftInfo);
	}

	deleteAllGift(type: string) {
		this.giftList = this.giftList.filter(gift => gift.type !== type);
	}

	deleteGift({ type, value }: TUserGiftInfo) {
		const idx = this.giftList.findIndex(v => v.type === type && v.value === value);
		if (idx === -1) {
			throw Error('해당하는 선물이 없습니다. 다시 확인해주세요!');
		}
		this.giftList.splice(idx, 1);
	}

	/** 유저 디스코드 아이디 가져오기 */
	getId() {
		return this._id;
	}

	getStock(name: string) {
		if (this.stockList.length <= 0) {
			throw Error('보유하고 있는 주식이 없습니다');
		}

		if (this.stockList.at(0)?.stock instanceof Types.ObjectId) {
			throw Error('Populated Error.. 운영자에게 문의하세요');
		}

		return this.stockList.find(stockInfo => (<IStock2>stockInfo.stock).name === name);
	}

	getWeapon(type: string) {
		if (this.weaponList.length <= 0) {
			throw Error('보유하고 있는 무기가 없습니다');
		}

		if (this.weaponList[0].weapon instanceof Types.ObjectId) {
			throw Error('Populated Error.. 운영자에게 문의하세요');
		}
		const myWeapon = this.weaponList.find(
			weaponInfo =>
				!(weaponInfo.weapon instanceof Types.ObjectId) && weaponInfo.weapon.type === type,
		);
		return myWeapon as TPopulatedUserWeaponInfo;
	}
}
