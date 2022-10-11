import _ from 'lodash';
import Condition from './ExternalOption/Condition';
import Game from '../Game';
import Coin from './Coin';
import Stock from './Stock';
import User from '../User';

export interface MyStockInfo {
	stockList: Array<{
		name: string;
		cnt: number;
		myRatio: number;
		myValue: number;
		stockValue: number;
		stockType: 'stock' | 'coin';
		stockBeforeRatio: number;
	}>;
	totalMyValue: number;
	totalStockValue: number;
}

interface GambleInfo {
	coinList: Array<Coin>;
	stockList: Array<Stock>;
	curCondition: number;
	curTime: number;
	conditionPeriod: number;
	conditionRatioPerList: number[];
}

type GambleConstructor = Partial<GambleInfo>;

export default class Gamble {
	coinList: GambleInfo['coinList'];
	conditionPeriod: GambleInfo['conditionPeriod'];
	conditionRatioPerList: GambleInfo['conditionRatioPerList'];
	curCondition: GambleInfo['curCondition'];
	curTime: GambleInfo['curTime'];
	stockList: GambleInfo['stockList'];

	constructor({
		coinList,
		stockList,
		curCondition,
		curTime,
		conditionPeriod,
		conditionRatioPerList,
	}: GambleConstructor) {
		this.coinList = coinList ?? [];
		this.stockList = stockList ?? [];
		this.conditionRatioPerList = conditionRatioPerList ?? [4, 16, 16, 4];
		this.curCondition = curCondition ?? 0;
		this.curTime = curTime ?? 0;
		this.conditionPeriod = conditionPeriod ?? 24;
	}

	addStock(stock: Stock | Coin) {
		const list = <Array<Stock | Coin>>this[`${stock.type}List`];
		const isExistStock = list.find(stockInfo => stockInfo.name === stock.name);
		if (isExistStock) {
			throw Error('이미 있는 주식입니다.');
		}
		list.push(stock);
	}

	/**
	 * @param {} userId 디스코드 아이디
	 * @param {} stockName 주식 이름
	 * @param {} cnt 팔고살 주식 갯수, 파는거면 마이너스값
	 * @param {} isFull
	 */
	buySellStock(
		userId: string,
		stockName: string,
		cnt: number,
		isFull: boolean,
	): { cnt: number; value: number; money: number } {
		const userInfo = Game.getUser({ discordId: userId });
		if (!userInfo) {
			throw Error('유저정보가 없습니다');
		}

		const stockInfo = [...this.stockList, ...this.coinList].find(
			stock => stock.name === stockName,
		);
		if (!stockInfo) {
			throw Error('주식/코인정보가 없습니다');
		}

		const stockResult = userInfo.updateStock(stockInfo, cnt, isFull);
		return stockResult;
	}

	/** 주식/코인 리스트에서 name에 해당하는 정보 가져오기 */
	getAllStock(type?: 'stock' | 'coin' | string): Array<Coin | Stock> {
		switch (type) {
			case 'coin':
				return this.coinList;
			case 'stock':
				return this.stockList;
			default:
				return [...this.stockList, ...this.coinList];
		}
	}

	/** 내가 가지고 있는 주식리스트 */
	getMyStock(myDiscordId: string): MyStockInfo {
		const user = Game.getUser({ discordId: myDiscordId });
		if (!user) {
			throw Error('유저정보를 찾을 수 없습니다.');
		}

		const stockInfo = user.stockList.reduce(
			(acc: MyStockInfo, myStock) => {
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

	/** 주식/코인 리스트에서 name에 해당하는 정보 가져오기 */
	getStock(type: 'stock' | 'coin' | '', name: string): Stock | Coin | undefined {
		if (!type) {
			return [...this.stockList, ...this.coinList].find(stock => {
				return stock.name === name;
			});
		}
		return (<Array<Stock | Coin>>this[`${type}List`]).find(stock => {
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
	update(): { stockList: Array<Stock | Coin>; userList: User[] } {
		const updStockList: Array<Stock | Coin> = [];
		let updUserList: User[] = [];
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
		let perTotal = 0;

		this.curCondition = 0;
		this.conditionRatioPerList.some((ratio, idx) => {
			if (randIdx <= ratio + perTotal) {
				this.curCondition = idx + 1;
				return true;
			}
			perTotal += ratio;
			return false;
		});
	}

	/** 돈 갱신 */
	updateMoney(userId: string, value: number): User {
		const userInfo = Game.getUser({ discordId: userId });
		if (!userInfo) {
			throw Error('유저정보가 없습니다');
		}
		userInfo.updateMoney(value);
		return userInfo;
	}
}
