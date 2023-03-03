import { inject, injectable } from 'inversify';
import { IUserStockController } from '../../interfaces/common/controller/userStock';
import { IStockService } from '../../interfaces/services/stockService';
import { IUserService } from '../../interfaces/services/userService';
import TYPES from '../../interfaces/containerType';

@injectable()
export default class UserStockController implements IUserStockController {
	stockService: IStockService;
	userService: IUserService;

	constructor(
		@inject(TYPES.UserService) userService: IUserStockController['userService'],
		@inject(TYPES.StockService) stockService: IUserStockController['stockService'],
	) {
		this.userService = userService;
		this.stockService = stockService;
	}

	async tradeStock({
		discordId,
		stockName,
		cnt,
		isFull,
	}: {
		discordId: string;
		stockName: string;
		cnt: number;
		isFull: boolean;
	}): Promise<{ cnt: number; value: number }> {
		const user = await this.userService.getUser({ discordId }, ['stockList.stock']);
		const stock = await this.stockService.getStock(stockName);

		const result = await this.userService.tradeStock(user, stock, cnt, isFull);
		return result;
	}
}
