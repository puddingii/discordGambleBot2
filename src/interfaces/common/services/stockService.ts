import { IStockStatics } from '../../../common/model/Stock';
import { ICoin, IStock2, TCoinInfo, TStockInfo2 } from '../../game/stock';
import { TPopulatedUserStockInfo, TUserStockInfo } from '../../game/user';

export type TStockName = 'coin' | 'stock';

export type TValidStockParam = Omit<TStockInfo2, 'beforeHistoryRatio' | 'type'> & {
	type: 'stock';
};

export type TValidCoinParam = Omit<TCoinInfo, 'beforeHistoryRatio' | 'type'> & {
	type: 'coin';
};

export interface IStockService {
	stockModel: IStockStatics;
	/** 새로운 주식 추가 */
	addStock(stockInfo: TValidStockParam): Promise<IStock2>;
	/** 새로운 코인 추가 */
	addCoin(stockInfo: TValidCoinParam): Promise<ICoin>;
	/** 데이터를 차트레이블 데이터로 변환(xlabel, ylabel 등..) */
	convertListToChartData(
		list: Array<{ value: number; date: string }>,
		stackCnt: number,
		chartType: 'stick' | 'line',
	): {
		xDataList: Array<string>;
		yDataList: Array<Array<number> | number>;
	};
	/** 모든 주식 가져오기 */
	getAllStock(type?: TStockName): Promise<Array<IStock2 | ICoin>>;
	/** 주식 가져오기 */
	getStock(stockName: string): Promise<TPopulatedUserStockInfo['stock']>;
	/** 주식 등락히스토리 가져오기 */
	getStockUpdateHistoryList(
		stockName: string,
		limitedCnt: number,
	): Promise<Array<{ value: number; date: string }>>;
	/** 주식 배당금 계산 */
	getStockDividend(stock: TUserStockInfo['stock'], cnt: number): number;
	/** 주식정보 업데이트 */
	updateStock(stock: IStock2, param: TValidStockParam): Promise<void>;
	/** 주식정보 업데이트 */
	updateCoin(stock: ICoin, param: TValidCoinParam): Promise<void>;
	/** 주식 랜덤 업데이트 */
	updateRandomStock(
		stockList: Array<TPopulatedUserStockInfo['stock']>,
		status: { curCondition: number; curTime: number },
	): Promise<void>;
}

export default {};