import Condition from './ExternalOption/Condition';
import Coin from './Coin';
import Stock from './Stock';

interface DataInfo {
	coinList: Array<Coin>;
	stockList: Array<Stock>;
	curCondition: number;
	curTime: number;
	conditionPeriod: number;
	conditionRatioPerList: number[];
}

/** Singleton Stock Data Manager */
export default class StockManager {
	private static instance: StockManager;
	public static getInstance(dataInfo?: DataInfo) {
		if (!StockManager.instance) {
			StockManager.instance = new StockManager(dataInfo);
		}
		return StockManager.instance;
	}
	coinList: DataInfo['coinList'] = [];
	conditionPeriod: DataInfo['conditionPeriod'] = 24;
	conditionRatioPerList: DataInfo['conditionRatioPerList'] = [4, 16, 16, 4];
	curCondition: DataInfo['curCondition'] = 0;
	curTime: DataInfo['curTime'] = 0;
	stockList: DataInfo['stockList'] = [];

	private constructor(dataInfo?: DataInfo) {
		if (dataInfo) {
			const {
				coinList,
				stockList,
				curCondition,
				curTime,
				conditionPeriod,
				conditionRatioPerList,
			} = dataInfo;
			this.coinList = coinList;
			this.stockList = stockList;
			this.conditionRatioPerList = conditionRatioPerList;
			this.curCondition = curCondition;
			this.curTime = curTime;
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
	update(): { stockList: Array<Stock>; coinList: Array<Coin> } {
		const updStockList: Array<Stock> = [];
		const updCoinList: Array<Coin> = [];
		this.stockList.forEach(stock => {
			const myStock = new Condition(stock);
			const ratio = myStock.getRandomRatio();
			const updResult = stock.update(this.curTime, ratio, this.curCondition);
			updResult.code && updStockList.push(stock);
		});
		this.coinList.forEach(coin => {
			const ratio = coin.getRandomRatio();
			const result = coin.update(this.curTime, ratio);
			result.code && updCoinList.push(coin);
		});
		return { stockList: updStockList, coinList: updCoinList };
	}
}