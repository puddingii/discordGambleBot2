import { IStockService } from '../../services/stockService';
import { IUserService } from '../../services/userService';

export interface IUserStockController {
	userService: IUserService;
	stockService: IStockService;
	/** 주식거래 */
	tradeStock({
		discordId,
		stockName,
		cnt,
		isFull,
	}: {
		discordId: string;
		stockName: string;
		cnt: number;
		isFull: boolean;
	}): Promise<{ cnt: number; value: number }>;
}
