/**
 * @typedef {import('./Gamble/Stock') | import('./Gamble/Coin')} stock
 * @typedef {import('./Weapon/Sword')} weapon
 * @typedef {{ stock: stock, cnt: number, value: number}} userStockInfo
 * @typedef {{ code: number, message?: string }} DefaultResult
 */

module.exports = class User {
	#id;
	/**
	 * @param {{ id: string, nickname: string, money: number, stockList: userStockInfo[], weaponList: weapon[]}}
	 */
	constructor({ id, nickname, money, stockList, weaponList }) {
		this.#id = id;
		this.nickname = nickname;
		this.money = money ?? 1000000;
		this.stockList = stockList ?? [];
		this.weaponList = weaponList ?? [];
	}

	/** 유저 디스코드 아이디 가져오기 */
	getId() {
		return this.#id;
	}

	/**
	 * 가지고 있는 name에 해당하는 주식 가져오기
	 * @param {string} name 유저이름
	 * @return {userStockInfo | undefined}
	 */
	getStock(name) {
		return this.stockList.find(stockInfo => stockInfo.stock.name === name);
	}

	/**
	 * 가지고 있는 무기 가져오기
	 * @param {string} type
	 */
	getWeapon(type) {
		return this.weaponList.find(weaponInfo => weaponInfo.type === type);
	}

	/** 가지고 있는 주식들 배당금 지급
	 * @return {{ code: number }}
	 */
	giveDividend() {
		const totalMoney = this.stockList.reduce((acc, cur) => {
			if (cur.cnt > 0 && cur.stock.type === 'stock') {
				acc += cur.stock.dividend * cur.stock.value * cur.cnt;
			}
			return acc;
		}, 0);
		this.money += totalMoney;
		return { code: !!totalMoney };
	}

	/**
	 * @param {Number} money
	 * @param {'stock' | 'coin' | 'weapon' | undefined} type
	 * @return {DefaultResult}
	 */
	updateMoney(money, type) {
		if (this.money + money < 0) {
			return { code: 0, message: '돈이 부족함' };
		}
		let extraCommission = 1;
		/** 주식이고 파는 경우 수수료 2%를 땐다. */
		if (money > 0 && type === 'stock') {
			extraCommission = 0.98;
		}
		this.money += money * extraCommission;
		return { code: 1 };
	}
	/**
	 * 가지고 있는 주식 업데이트 하기(사고 팔때 사용)
	 * @param {stock} stock
	 * @param {number} cnt isFull이 true인 경우 매수는 양수값 매도는 음수값을 넣어줘야함
	 * @param {boolean} isFull
	 * @return {DefaultResult & { cnt?: number, value?: number, money?: number }}
	 */
	updateStock(stock, cnt, isFull) {
		const myStock = this.getStock(stock.name);
		if (isFull) {
			cnt = cnt > 0 ? Math.floor(this.money / stock.value) : (myStock?.cnt ?? 0) * -1;
		}
		if (!cnt) {
			return { code: 0, message: '돈이 부족하거나 갯수 입력값이 잘못됨.' };
		}
		/** 파는데 숫자가 잘못될 경우 */
		if ((myStock && myStock.cnt + cnt < 0) || (!myStock && cnt < 0)) {
			return { code: 0, message: '가지고있는 갯수보다 많이 입력함.' };
		}

		const totalMoney = cnt * stock.value;
		const updateResult = this.updateMoney(totalMoney * -1, stock.type);
		if (!updateResult.code) {
			return updateResult;
		}
		/** 예전에 사고판적이 있을 때 */
		let averageValue = 0;
		let totalCnt = cnt;
		if (myStock) {
			averageValue = Math.floor(
				(myStock.cnt * myStock.value + totalMoney) / (myStock.cnt + cnt),
			);
			averageValue = myStock.cnt + cnt !== 0 ? averageValue : 0;
			totalCnt += myStock.cnt;
			myStock.value = averageValue;
			myStock.cnt += cnt;
		} else {
			/** 처음 살 때 */
			averageValue = stock.value;
			this.stockList.push({ stock, cnt, value: averageValue });
		}

		return { code: 1, cnt: totalCnt, value: averageValue, money: this.money };
	}
};
