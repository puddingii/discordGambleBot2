import { inject, injectable } from 'inversify';
import { Types } from 'mongoose';
import TYPES from '../interfaces/containerType';
import { IUserService, TUserParam } from '../interfaces/services/userService';
import User from '../game/User/User';
import Stock from '../game/Stock/Stock';
import Weapon from '../game/weapon/Weapon';
import { IUser, TUserGiftInfo } from '../interfaces/game/user';

@injectable()
class UserService implements IUserService {
	stockModel: IUserService['stockModel'];
	userModel: IUserService['userModel'];
	weaponModel: IUserService['weaponModel'];

	constructor(
		@inject(TYPES.UserModel) userModel: IUserService['userModel'],
		@inject(TYPES.StockModel) stockModel: IUserService['stockModel'],
		@inject(TYPES.WeaponModel) weaponModel: IUserService['weaponModel'],
	) {
		this.userModel = userModel;
		this.stockModel = stockModel;
		this.weaponModel = weaponModel;
	}

	async addGift(userParam: TUserParam, giftInfo: TUserGiftInfo) {
		await this.userModel.addGift(userParam, giftInfo);
	}

	async addUser(userInfo: { id: string; nickname: string }) {
		await this.userModel.addNewUser(userInfo.id, userInfo.nickname);
	}

	async getUser(
		userParam: TUserParam,
		populatedList?: Array<'stockList.stock' | 'weaponList.weapon'>,
	) {
		let userInfo = await this.getUserInfo(userParam);
		if (populatedList && populatedList.length > 0) {
			const populatedStr = populatedList.join(' ');
			userInfo = await userInfo.populate(populatedStr);
		}

		const stockList = userInfo.stockList.map(stockInfo => {
			const { cnt, value } = stockInfo;
			const { stock } = stockInfo;
			const myStock =
				stock instanceof Types.ObjectId
					? stock
					: new Stock({
							name: stock.name,
							ratio: { max: stock.maxRatio, min: stock.minRatio },
							type: <'stock'>stock.type,
							updateTime: stock.updateTime,
							value: stock.value,
							comment: stock.comment,
							conditionList: stock.conditionList,
							correctionCnt: stock.correctionCnt,
							dividend: stock.dividend,
					  });
			return { stock: myStock, cnt, value };
		});

		const weaponList = userInfo.weaponList.map(weaponInfo => {
			const { weapon } = weaponInfo;
			const myWeapon =
				weapon instanceof Types.ObjectId
					? weapon
					: new Weapon({
							baseMoney: weapon.baseMoney,
							enhanceCost: weapon.enhanceCost,
							maxPower: weapon.maxPower,
							name: weapon.name,
							powerMultiple: weapon.powerMultiple,
							ratioList: weapon.ratioList,
							type: weapon.type,
							comment: weapon.comment,
					  });
			return { ...weaponInfo, weapon: myWeapon };
		});

		const user = new User({
			id: userInfo.discordId,
			nickname: userInfo.nickname,
			money: userInfo.money,
			giftList: userInfo.giftList,
			stockList,
			weaponList,
		});

		return user;
	}

	private async getUserInfo(userParam: TUserParam) {
		const userInfo = await this.userModel.findOne(userParam);
		if (!userInfo) {
			throw Error('[Service] 해당하는 유저데이터가 없습니다');
		}

		return userInfo;
	}

	async tradeStock(
		user: IUser,
		stockName: string,
		cnt: number,
		isFull: boolean,
	): Promise<void> {
		const stockInfo = await this.stockModel.findOne({ name: stockName });
		if (!stockInfo) {
			throw Error('해당하는 주식/코인이 없습니다.');
		}
	}

	async updateMoney(user: IUser, money: number, type?: 'stock' | 'coin' | 'weapon') {
		if (user.money + money < 0) {
			throw Error('돈이 부족함');
		}
		let extraCommission = 1;
		// 주식이고 파는 경우 수수료 2%를 땐다.
		if (money > 0 && type === 'stock') {
			extraCommission = 0.98;
		}
		user.money += money * extraCommission;

		await this.userModel.updateMoney({ discordId: user.getId() }, user.money);
	}
}

export default UserService;
