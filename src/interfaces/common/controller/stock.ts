import { TStockClassType } from '../../game/stock';
import {
	IStockService,
	TStockName,
	TInvalidatedCoinData,
	TInvalidatedStockData,
} from '../services/stockService';

export interface IStockController {
	stockService: IStockService;
	/** 주식정보 가져오기 */
	getStock(name: string): Promise<TStockClassType>;
	/** 타입에 해당하는 모든 주식 가져오기 */
	getAllStock(type?: TStockName): Promise<Array<TStockClassType>>;
	/** 차트 데이터 생성 */
	getChartData({
		stockName,
		stickTime,
		chartType,
	}: {
		stockName: string;
		stickTime: number;
		chartType: 'stick' | 'line';
	}): Promise<{
		xDataList: Array<string>;
		yDataList: Array<Array<number> | number>;
	}>;
	/** 주식 업데이트 */
	updateStock(param: TInvalidatedStockData | TInvalidatedCoinData): Promise<void>;
}
