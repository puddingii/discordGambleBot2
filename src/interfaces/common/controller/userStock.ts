import { ILogger } from '../../../common/util/logger';
import { IStatusService } from '../services/statusService';
import {
	IStockService,
	TValidCoinParam,
	TValidStockParam,
} from '../services/stockService';
import { IUserService } from '../services/userService';

export interface IUserStockController {
	userService: IUserService;
	stockService: IStockService;
	statusService: IStatusService;
	logger: ILogger;
	/** 주식추가 */
	addStockAndUpdateUsers(param: TValidStockParam): Promise<void>;
	/** 코인추가 */
	addCoinAndUpdateUsers(param: TValidCoinParam): Promise<void>;
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
	/** 주식정보 갱신 및 배당금 지급 */
	updateStockRandomAndGiveDividend(): Promise<void>;
}
