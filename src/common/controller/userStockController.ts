import { inject, injectable } from 'inversify';
import { IUserStockController } from '../../interfaces/common/controller/userStock';
import {
	TValidCoinParam,
	TValidStockParam,
} from '../../interfaces/common/services/stockService';
import TYPES from '../../interfaces/containerType';
import { TUserGiftInfo } from '../../interfaces/game/user';
import { IStock2 } from '../../interfaces/game/stock';

@injectable()
export default class UserStockController implements IUserStockController {
	logger: IUserStockController['logger'];
	statusService: IUserStockController['statusService'];
	stockService: IUserStockController['stockService'];
	userService: IUserStockController['userService'];

	constructor(
		@inject(TYPES.UserService) userService: IUserStockController['userService'],
		@inject(TYPES.StockService) stockService: IUserStockController['stockService'],
		@inject(TYPES.StatusService) statusService: IUserStockController['statusService'],
		@inject(TYPES.Logger) logger: IUserStockController['logger'],
	) {
		this.userService = userService;
		this.stockService = stockService;
		this.statusService = statusService;
		this.logger = logger;
	}

	async addCoinAndUpdateUsers(param: TValidCoinParam): Promise<void> {
		const stock = await this.stockService.addCoin(param);
		await this.userService.addStock(stock);
	}

	async addStockAndUpdateUsers(param: TValidStockParam): Promise<void> {
		const stock = await this.stockService.addStock(param);
		await this.userService.addStock(stock);
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

	async updateStockRandomAndGiveDividend(): Promise<void> {
		const { curTime, curCondition } = await this.statusService.getGambleStatus();
		const stockList = await this.stockService.getAllStock();
		await this.stockService.updateRandomStock(stockList, { curTime, curCondition });

		if (curTime % 48 !== 0) {
			return;
		}
		const userList = await this.userService.getAllUser(['stockList.stock']);

		const updateUserList = userList.map(user => {
			const giftList: Array<TUserGiftInfo> = [];
			user.stockList.forEach(stock => {
				const money = this.stockService.getStockDividend(stock.stock, stock.cnt);
				if (money) {
					giftList.push({
						type: 'money',
						value: money,
						comment: `${(<IStock2>stock.stock).name}의 배당금`,
					});
				}
			});
			return this.userService.addGiftList(user, giftList);
		});

		const resultList = await Promise.allSettled(updateUserList);

		resultList.forEach(result => {
			if (result.status !== 'fulfilled') {
				this.logger.error(`${result.reason}`, ['Controller']);
			}
		});
	}
}
