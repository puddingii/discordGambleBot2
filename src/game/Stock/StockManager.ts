import Condition from './ExternalOption/Condition';
import Coin from './Coin';
import Stock from './Stock';

interface DataInfo {
	coinList: Array<Coin>;
	stockList: Array<Stock>;
	curCondition: number;
	conditionPeriod: number;
	conditionRatioPerList: number[];
}

/** Singleton Stock Data Manager */
export default class StockManager {
	coinList: DataInfo['coinList'] = [];
	conditionPeriod: DataInfo['conditionPeriod'] = 24;
	conditionRatioPerList: DataInfo['conditionRatioPerList'] = [4, 16, 16, 4];
	curCondition: DataInfo['curCondition'] = 0;
	stockList: DataInfo['stockList'] = [];

	constructor(dataInfo?: DataInfo) {
		if (dataInfo) {
			const {
				coinList,
				stockList,
				curCondition,
				conditionPeriod,
				conditionRatioPerList,
			} = dataInfo;
			this.coinList = coinList;
			this.stockList = stockList;
			this.conditionRatioPerList = conditionRatioPerList;
			this.curCondition = curCondition;
			this.conditionPeriod = conditionPeriod;
		}
	}

	/** 주식 추가 */
	addStock<T extends Stock | Coin>(stock: T) {
		const list = <Array<T>>this[`${stock.type}List`];
		const isExistStock = list.find(stockInfo => stockInfo.name === stock.name);
		if (isExistStock) {
			throw Error('이미 있는 주식입니다.');
		}
		list.push(stock);
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

	/** 주식정보 갱신하기 */
	update(curTime: number): { stockList: Array<Stock>; coinList: Array<Coin> } {
		const updStockList: Array<Stock> = [];
		const updCoinList: Array<Coin> = [];
		this.stockList.forEach(stock => {
			const myStock = new Condition(stock);
			const ratio = myStock.getRandomRatio();
			const updResult = stock.update(curTime, ratio, this.curCondition);
			updResult.code && updStockList.push(stock);
		});
		this.coinList.forEach(coin => {
			const ratio = coin.getRandomRatio();
			const result = coin.update(curTime, ratio);
			result.code && updCoinList.push(coin);
		});
		return { stockList: updStockList, coinList: updCoinList };
	}

	/** Gamble의 condition 조정 */
	updateCondition(curTime: number) {
		if (curTime % this.conditionPeriod !== 0) {
			return;
		}
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
}
