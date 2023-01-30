import Stock from '../Stock/Stock';
import Coin from '../Stock/Coin';
import Sword from '../Weapon/Sword';

/** Class Constructor Param Type */

/** 유저가 가지고 있는 주식정보 타입 */
export type UserStockInfo = {
	stock: Stock | Coin;
	cnt: number;
	value: number;
};

/** 유저가 가지고 있는 무기정보 */
export type UserWeaponInfo = {
	weapon: Sword;
	destroyCnt: number;
	failCnt: number;
	successCnt: number;
	curPower: number;
	bonusPower: number;
	hitRatio: number;
	missRatio: number;
};

interface UserInfo {
	id: string;
	nickname: string;
	money: number;
	stockList: Array<UserStockInfo>;
	weaponList: Array<UserWeaponInfo>;
}

type UserConstructor = Pick<UserInfo, 'id' | 'nickname'> &
	Omit<Partial<UserInfo>, 'id' | 'nickname'>;

/** 유저가 가지고 있는 Stock 업데이트 할 때 사용하는 함수리턴 타입 */
type UpdateStockReturnType = { cnt: number; value: number; money: number };

export default class User {
	private _id: UserInfo['id'];
	money: UserInfo['money'];
	nickname: UserInfo['nickname'];
	stockList: UserInfo['stockList'];
	weaponList: UserInfo['weaponList'];

	constructor({ id, nickname, money, stockList, weaponList }: UserConstructor) {
		this._id = id;
		this.nickname = nickname;
		this.money = money ?? 1000000;
		this.stockList = stockList ?? [];
		this.weaponList = weaponList ?? [];
	}

	/** 유저 디스코드 아이디 가져오기 */
	getId() {
		return this._id;
	}

	/** 가지고 있는 name에 해당하는 주식 가져오기 */
	getStock(name: string) {
		return this.stockList.find(stockInfo => stockInfo.stock.name === name);
	}

	/** 가지고 있는 무기 가져오기 */
	getWeapon(type: string) {
		return this.weaponList.find(weaponInfo => weaponInfo.weapon.type === type);
	}

	/** 가지고 있는 주식들 배당금 지급 */
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

	/** 유저가 가지고 있는 돈 업데이트 */
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

	/** 가지고 있는 주식 업데이트 하기(사고 팔때 사용) 살때는 cnt가 양수 아니면 음수 */
	updateStock(stock: Stock | Coin, cnt: number, isFull: boolean): UpdateStockReturnType {
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
