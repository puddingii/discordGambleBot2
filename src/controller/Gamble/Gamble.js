const _ = require('lodash');
const Condition = require('./ExternalOption/Condition');
const Game = require('../Game');

/**
 * @typedef {import('./Coin')} Coin
 * @typedef {import('./Stock')} Stock
 * @typedef {import('../User')} User
 * @typedef {{ code: number, message?: string }} DefaultResult
 * @typedef {object} GambleInitInfo
 * @property {Coin[]} coinList
 * @property {Stock[]} stockList
 * @property {number} curCondition
 * @property {number} curTime
 * @property {number} conditionPeriod
 * @property {number[]} conditionRatioPerList
 */

module.exports = class Gamble {
	/**
	 * @param {GambleInitInfo}
	 */
	constructor({
		coinList,
		stockList,
		curCondition,
		curTime,
		conditionPeriod,
		conditionRatioPerList,
	}) {
		/** @type {Array<Coin>} */
		this.coinList = coinList ?? [];
		/** @type {Array<Stock>} */
		this.stockList = stockList ?? [];
		this.conditionRatioPerList = conditionRatioPerList ?? [4, 16, 16, 4];
		this.curCondition = curCondition ?? 0;
		this.curTime = curTime ?? 0;
		this.conditionPeriod = conditionPeriod ?? 24;
	}

	/**
	 * @param {Stock | Coin} stock
	 * @return {DefaultResult}
	 */
	addStock(stock) {
		const isExistStock = this[`${stock.type}List`].find(
			stockInfo => stockInfo.name === stock.name,
		);
		if (isExistStock) {
			return { code: 0, message: '이미 있는 주식입니다.' };
		}
		this[`${stock.type}List`].push(stock);
		return { code: 1 };
	}

	/**
	 * @param {string} userId 디스코드 아이디
	 * @param {string} stockName 주식 이름
	 * @param {number} cnt 팔고살 주식 갯수, 파는거면 마이너스값
	 * @param {boolean} isFull
	 * @returns {DefaultResult & { cnt?: number, value?: number, money?: number }}
	 */
	buySellStock(userId, stockName, cnt, isFull) {
		const userInfo = Game.getUser({ discordId: userId });
		if (!userInfo) {
			return { code: 0, message: '유저정보가 없습니다' };
		}
		const stockInfo = this.stockList
			.concat(this.coinList)
			.find(stock => stock.name === stockName);
		if (!stockInfo) {
			return { code: 0, message: '주식/코인정보가 없습니다' };
		}
		const stockResult = userInfo.updateStock(stockInfo, cnt, isFull);
		return stockResult;
	}

	/**
	 * 주식/코인 리스트에서 name에 해당하는 정보 가져오기
	 * @param {'stock' | 'coin'| 'all'} type
	 * @return {Coin[] | Stock[]}
	 */
	getAllStock(type) {
		switch (type) {
			case 'coin':
				return this.coinList;
			case 'stock':
				return this.stockList;
			default:
				return this.stockList.concat(this.coinList);
		}
	}

	/**
	 * 내가 가지고 있는 주식리스트
	 * @param {string} myDiscordId
	 * @return {{ stockList: {name: string, cnt: number, myRatio: number, myValue: number, stockValue: number, stockType: 'stock' | 'coin', stockBeforeRatio: number}[], totalMyValue: number, totalStockValue: number}}
	 */
	getMyStock(myDiscordId) {
		const user = Game.getUser({ discordId: myDiscordId });
		if (!user) {
			return { code: 1, message: '유저정보를 찾을 수 없습니다.' };
		}

		const stockInfo = user.stockList.reduce(
			(acc, myStock) => {
				if (myStock.cnt > 0) {
					const myRatio = _.round((myStock.stock.value / myStock.value) * 100 - 100, 2);
					acc.stockList.push({
						name: myStock.stock.name,
						cnt: myStock.cnt,
						myValue: myStock.value,
						myRatio,
						stockValue: myStock.stock.value,
						stockType: myStock.stock.type,
						stockBeforeRatio: _.round(myStock.stock.beforeHistoryRatio * 100, 2),
					});
					acc.totalMyValue += myStock.cnt * myStock.value;
					acc.totalStockValue += myStock.cnt * myStock.stock.value;
				}
				return acc;
			},
			{ stockList: [], totalMyValue: 0, totalStockValue: 0 },
		);

		return stockInfo;
	}

	/**
	 * 주식/코인 리스트에서 name에 해당하는 정보 가져오기
	 * @param {'stock' | 'coin' | ''} type
	 * @param {string} name
	 * @returns {Stock | Coin | undefined}
	 */
	getStock(type, name) {
		if (!type) {
			return this.stockList.concat(this.coinList).find(stock => {
				return stock.name === name;
			});
		}
		return this[`${type}List`].find(stock => {
			return stock.name === name;
		});
	}

	/** Gamble 시간마다 업데이트 로직 시작 */
	start() {
		setInterval(() => {
			/** 6시간마다 컨디션 조정 */
			if (this.curTime % 12 === 0) {
				this.updateCondition();
			}
			this.curTime++;
			this.update();
		}, 1000 * 60 * 30);
	}

	/** 주식정보 갱신하기 */
	update() {
		const updStockList = [];
		let updUserList = [];
		this.stockList.forEach(stock => {
			const myStock = new Condition(stock);
			const ratio = myStock.getRandomRatio();
			const updResult = stock.update(this.curTime, ratio, this.curCondition);
			updResult.code && updStockList.push(stock);
		});
		// 주식 배당금
		if (this.curTime % 48 === 0) {
			updUserList = Game.userList.filter(user => {
				const result = user.giveDividend();
				return !!result.code;
			});
		}
		this.coinList.forEach(coin => {
			const ratio = coin.getRandomRatio();
			const result = coin.update(this.curTime, ratio);
			result.code && updStockList.push(coin);
		});
		return { stockList: updStockList, userList: updUserList };
	}

	/** Gamble의 condition 조정 */
	updateCondition() {
		const randIdx = Math.floor(Math.random() * 100) + 1;
		this.curCondition = 0;
		let perTotal = 0;
		this.conditionRatioPerList.some((ratio, idx) => {
			if (randIdx <= ratio + perTotal) {
				this.curCondition = idx + 1;
				return true;
			}
			perTotal += ratio;
			return false;
		});
	}

	/**
	 * 돈 갱신
	 * @param {string} userId 유저아이디
	 * @param {number} value 업데이트 할 금액
	 * @returns {DefaultResult & { userInfo?: Stock }}
	 */
	updateMoney(userId, value) {
		const userInfo = Game.getUser({ discordId: userId });
		if (!userInfo) {
			return { code: 0, message: '유저정보가 없습니다' };
		}
		const result = userInfo.updateMoney(value);
		return { ...result, userInfo };
	}
};
