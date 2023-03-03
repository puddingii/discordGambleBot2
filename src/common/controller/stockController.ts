import { inject, injectable } from 'inversify';
import TYPES from '../../interfaces/containerType';
import {
	IStockService,
	TStockName,
	TValidCoinParam,
	TValidStockParam,
} from '../../interfaces/common/services/stockService';
import { ICoin, IStock2, TStockClassType } from '../../interfaces/game/stock';
import { IStockController } from '../../interfaces/common/controller/stock';

@injectable()
export default class StockController implements IStockController {
	stockService: IStockService;

	constructor(
		@inject(TYPES.StockService) stockService: IStockController['stockService'],
	) {
		this.stockService = stockService;
	}

	async getAllStock(type?: TStockName | undefined): Promise<TStockClassType[]> {
		const stockList = await this.stockService.getAllStock(type);
		return stockList;
	}

	async getChartData({
		stockName,
		stickTime,
		chartType,
	}: {
		stockName: string;
		stickTime: number;
		chartType: 'stick' | 'line';
	}): Promise<{ xDataList: string[]; yDataList: (number | number[])[] }> {
		const stickPerCnt = stickTime / 2;
		const list = await this.stockService.getStockUpdateHistoryList(
			stockName,
			stickPerCnt * 30,
		);
		const chartData = this.stockService.convertListToChartData(
			list,
			stickPerCnt,
			chartType,
		);

		return chartData;
	}

	async getStock(name: string): Promise<TStockClassType> {
		const stock = await this.stockService.getStock(name);
		return stock;
	}

	async updateStock(param: TValidStockParam | TValidCoinParam): Promise<void> {
		const stock = await this.stockService.getStock(param.name);
		if (stock.type === 'stock') {
			await this.stockService.updateStock(stock as IStock2, param as TValidStockParam);
		} else {
			await this.stockService.updateCoin(stock as ICoin, param as TValidCoinParam);
		}
	}
}
