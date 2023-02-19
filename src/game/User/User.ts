import Stock from '../Stock/Stock';
import Coin from '../Stock/Coin';
import {
	IUser,
	IUserInfo,
	TUserGiftInfo,
	TUpdateStockResult,
	TUserConstructor,
} from '../../interfaces/game/user';

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
		return this.stockList.find(stockInfo => stockInfo.stock.name === name);
	}

	getWeapon(type: string) {
		return this.weaponList.find(weaponInfo => weaponInfo.weapon.type === type);
	}

	giveDividend(): { code: number } {
		const totalMoney = this.stockList.reduce((acc, cur) => {
			if (cur.cnt > 0 && cur.stock instanceof Stock && cur.stock.type === 'stock') {
				acc += cur.stock.dividend * cur.stock.value * cur.cnt;
			}
			return acc;
		}, 0);
		this.money += totalMoney;
		return { code: totalMoney ? 1 : 0 };
	}

	updateMoney(money: number, type?: 'stock' | 'coin' | 'weapon') {
		if (this.money + money < 0) {
			throw Error('돈이 부족함');
		}
		let extraCommission = 1;
		// 주식이고 파는 경우 수수료 2%를 땐다.
		if (money > 0 && type === 'stock') {
			extraCommission = 0.98;
		}
		this.money += money * extraCommission;
	}

	updateStock(stock: Stock | Coin, cnt: number, isFull: boolean): TUpdateStockResult {
		const myStock = this.getStock(stock.name);
		if (isFull) {
			cnt = cnt > 0 ? Math.floor(this.money / stock.value) : (myStock?.cnt ?? 0) * -1;
		}
		if (!cnt) {
			throw Error('돈이 부족하거나 갯수 입력값이 잘못됨.');
		}
		// 파는데 숫자가 잘못될 경우
		if ((myStock && myStock.cnt + cnt < 0) || (!myStock && cnt < 0)) {
			throw Error('가지고있는 갯수보다 많이 입력함.');
		}

		const totalMoney = cnt * stock.value;
		this.updateMoney(totalMoney * -1, stock.type);

		let averageValue = 0;
		let totalCnt = cnt;
		// 예전에 사고판적이 있을 때
		if (myStock) {
			// 팔 때면 수량의 차이만 있어야한다. 평단가가 바뀌면 안됨.
			if (totalMoney > 0) {
				averageValue = Math.floor(
					(myStock.cnt * myStock.value + totalMoney) / (myStock.cnt + cnt),
				);
				averageValue = myStock.cnt + cnt !== 0 ? averageValue : 0;
				myStock.value = averageValue;
			} else {
				averageValue = myStock.value;
			}
			totalCnt += myStock.cnt;
			myStock.cnt += cnt;
		} else {
			// 처음 살 때
			averageValue = stock.value;
			this.stockList.push({ stock: stock, cnt, value: averageValue });
		}

		return { cnt: totalCnt, value: averageValue, money: this.money };
	}
}
