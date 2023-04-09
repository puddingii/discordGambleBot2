import { inject, injectable } from 'inversify';
import _ from 'lodash';
import { container } from '../../settings/container';
import TYPES from '../../interfaces/containerType';
import {
	IUserService,
	TPopulatedList,
	TProcessedStockInfo,
} from '../../interfaces/common/services/userService';
import { ICoin, IStock } from '../../interfaces/game/stock';
import { IStatusService } from '../../interfaces/common/services/statusService';
import { IUserController } from '../../interfaces/common/controller/user';
import {
	IUser,
	TPopulatedUserWeaponInfo,
	TUserWeaponInfo,
} from '../../interfaces/game/user';

@injectable()
export default class UserController implements IUserController {
	statusService: IStatusService;
	userService: IUserService;

	constructor(
		@inject(TYPES.UserService) userService: IUserController['userService'],
		@inject(TYPES.StatusService) statusService: IUserController['statusService'],
	) {
		this.userService = userService;
		this.statusService = statusService;
	}

	async addUser(userInfo: { id: string; nickname: string }): Promise<void> {
		await this.userService.addUser(userInfo);
	}

	async generatePassword(discordId: string): Promise<string> {
		const myPassword = await this.userService.generatePassword(discordId);
		return myPassword;
	}

	async getMyStockList(discordId: string): Promise<TProcessedStockInfo> {
		const user = await this.userService.getUser({ discordId }, ['stockList.stock']);
		const stockInfo = this.userService.getProcessedStock(user);

		return stockInfo;
	}

	async getMyWeapon(
		discordId: string,
		type: string,
	): Promise<TPopulatedUserWeaponInfo | undefined> {
		const user = await this.userService.getUser({ discordId }, ['weaponList.weapon']);

		return user.getWeapon(type);
	}

	async getMyWeaponList(discordId: string): Promise<TUserWeaponInfo[]> {
		const user = await this.userService.getUser({ discordId }, ['weaponList.weapon']);

		return user.weaponList;
	}

	// FIXME
	async getRankingList(): Promise<{ name: string; money: number }[]> {
		const userList = await this.getUserList(['stockList.stock']);
		const rankingList = userList.map(user => {
			const money =
				user.stockList.reduce((acc, cur) => {
					acc += cur.cnt * (<IStock | ICoin>cur.stock).value;
					return acc;
				}, 0) + user.money;
			return {
				name: user.nickname,
				money,
			};
		});

		return rankingList;
	}

	async getUser(
		userInfo: Partial<{ discordId: string; nickname: string }>,
		populatedList?: TPopulatedList | undefined,
	): Promise<IUser> {
		const user = await this.userService.getUser(userInfo, populatedList);

		return user;
	}

	async getUserList(populatedList?: TPopulatedList | undefined): Promise<IUser[]> {
		const userList = await this.userService.getAllUser(populatedList);
		return userList;
	}

	async getUserProfile(discordId: string) {
		const user = await this.userService.getUser({ discordId }, ['stockList.stock']);
		const { totalStockValue } = this.userService.getProcessedStock(user);
		const giftMoney = await this.userService.getReceivedAllGiftMoney(user);

		return { myMoney: user.money, totalStockValue, nickname: user.nickname, giftMoney };
	}

	async getUserSummary(discordId: string) {
		const user = await this.userService.getUser({ discordId }, ['stockList.stock']);
		const stockInfoList = this.userService.getProcessedStock(user);

		return {
			stockRatioList: stockInfoList.stockList.map(stock => ({
				value: stock.holdingRatio,
				name: stock.name,
			})),
			money: user.money,
			stockProfit: _.round(
				(stockInfoList.totalStockValue / stockInfoList.totalMyValue - 1) * 100,
				2,
			),
		};
	}

	async giveGrantMoney(discordId: string): Promise<number> {
		const user = await this.userService.getUser({ discordId });
		const { grantMoney } = await this.statusService.getUserStatus();
		await this.userService.updateMoney(user, grantMoney);
		await this.statusService.setUserStatus({ grantMoney: 0 });

		return grantMoney;
	}

	async giveMoney(
		myInfo: Partial<{ discordId: string; nickname: string }>,
		ptrInfo: Partial<{ discordId: string; nickname: string }>,
		money: number,
	): Promise<void> {
		const userService = container.get<IUserService>(TYPES.UserService);
		/** 회원 데이터 있는지 확인 */
		const sender = await userService.getUser(myInfo);
		const receiver = await userService.getUser(ptrInfo);

		/** 보낸 사람은 돈 차감, 받는 사람은 선물목록에 추가 */
		await userService.updateMoney(sender, money * -1);
		await userService.addGift(receiver, {
			type: 'money',
			value: money,
			comment: `${sender.nickname}이 보냄`,
		});
	}

	async receiveAllGiftMoney(discordId: string): Promise<number> {
		const totalMoney = await this.userService.receiveAllGiftMoney({ discordId });
		return totalMoney;
	}

	async updateMoney(
		userInfo: Partial<{ discordId: string; nickname: string }>,
		value: number,
	): Promise<IUser> {
		const user = await this.userService.getUser(userInfo);
		await this.userService.updateMoney(user, value);

		return user;
	}
}
