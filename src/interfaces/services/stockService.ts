import { IStockStatics } from '../../model/Stock';
import { IUserStatics } from '../../model/User';
import { IStock2, TStockInfo, TStockInfo2 } from '../game/stock';
import { TUserStockInfo } from '../game/user';

export type TStockType = 'coin' | 'stock';

export type TValidStockParam = Omit<TStockInfo2, 'beforeHistoryRatio' | 'type'> & {
	type: 'stock';
};

export type TValidCoinParam = Omit<TStockInfo, 'beforeHistoryRatio' | 'type'> & {
	type: 'coin';
};

export interface IStockService {
	userModel: IUserStatics;
	stockModel: IStockStatics;
	/** 새로운 주식 추가 */
	addStock(stockInfo: TValidStockParam): Promise<IStock2>;
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
	getAllStock(type?: TStockType): Promise<Array<IStock2>>;
	/** 주식 가져오기 */
	getStock(stockName: string): Promise<IStock2>;
	/** 주식 등락히스토리 가져오기 */
	getStockUpdateHistoryList(
		stockName: string,
		limitedCnt: number,
	): Promise<Array<{ value: number; date: string }>>;
	/** 주식 배당금 계산 */
	getStockDividend(stock: TUserStockInfo['stock'], cnt: number): number;
	/** 주식정보 업데이트 */
	updateStock(stock: IStock2, param: TValidStockParam): Promise<void>;
	/** 주식 랜덤 업데이트 */
	updateRandomStock(
		stockList: Array<IStock2>,
		status: { curCondition: number; curTime: number },
	): Promise<void>;
}

export default {};
