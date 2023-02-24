import { inject, injectable } from 'inversify';
import { Types } from 'mongoose';
import _ from 'lodash';
import TYPES from '../interfaces/containerType';
import {
	IUserService,
	TProcessedStockInfo,
	TUserParam,
} from '../interfaces/services/userService';
import User from '../game/User/User';
import Stock from '../game/Stock/Stock';
import Weapon from '../game/weapon/Weapon';
import { IUser, TUserGiftInfo, TUserWeaponInfo } from '../interfaces/game/user';
import { IStock2 } from '../interfaces/game/stock';
import { TUserModelInfo } from '../model/User';
import { IWeapon } from '../interfaces/game/weapon';
import { TEnhanceSimulateResult } from '../interfaces/services/weaponService';

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

	private convertDataToClass(userInfo: TUserModelInfo) {
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

	getProcessedStock(user: IUser) {
		const stockInfo = user.stockList.reduce(
			(acc: TProcessedStockInfo, myStock) => {
				if (myStock.stock instanceof Types.ObjectId) {
					return acc;
				}
				const stock = <IStock2>myStock.stock;
				if (myStock.cnt > 0) {
					const myRatio = _.round((stock.value / myStock.value) * 100 - 100, 2);
					acc.totalMyValue += myStock.cnt * myStock.value;
					acc.totalStockValue += myStock.cnt * stock.value;
					acc.stockList.push({
						name: stock.name,
						cnt: myStock.cnt,
						myValue: myStock.value,
						myRatio,
						stockValue: stock.value,
						stockType: stock.type,
						stockBeforeRatio: _.round(stock.beforeHistoryRatio * 100, 2),
						profilMargin: myStock.cnt * (stock.value - myStock.value),
					});
				}
				return acc;
			},
			{ stockList: [], totalMyValue: 0, totalStockValue: 0 },
		);
		return stockInfo;
	}

	async addGift(user: IUser, giftInfo: TUserGiftInfo) {
		user.giftList.push(giftInfo);
		await this.userModel.addGift({ discordId: user.getId() }, giftInfo);
	}

	async addUser(userInfo: { id: string; nickname: string }) {
		await this.userModel.addNewUser(userInfo.id, userInfo.nickname);
	}

	async addWeapon(weapon: IWeapon) {
		await this.userModel.addNewWeapon(weapon.type);
	}

	async getAllUser(populatedList?: Array<'stockList.stock' | 'weaponList.weapon'>) {
		const populatedStr = populatedList?.join(' ') ?? '';
		const userList = await this.userModel.find({}).populate(populatedStr);

		return userList.map(user => {
			return this.convertDataToClass(user);
		});
	}

	async getUser(
		userParam: TUserParam,
		populatedList?: Array<'stockList.stock' | 'weaponList.weapon'>,
	) {
		const populatedStr = populatedList?.join(' ') ?? '';
		const userInfo = await this.userModel.findOne(userParam).populate(populatedStr);
		if (!userInfo) {
			throw Error('해당하는 유저데이터가 없습니다');
		}

		const user = this.convertDataToClass(userInfo);

		return user;
	}

	async tradeStock(user: IUser, stock: IStock2, cnt: number, isFull: boolean) {
		const myStock = user.getStock(stock.name);
		if (isFull) {
			cnt = cnt > 0 ? Math.floor(user.money / stock.value) : (myStock?.cnt ?? 0) * -1;
		}
		if (!cnt) {
			throw Error('돈이 부족하거나 갯수 입력값이 잘못됨.');
		}
		// 파는데 숫자가 잘못될 경우
		if ((myStock && myStock.cnt + cnt < 0) || (!myStock && cnt < 0)) {
			throw Error('가지고있는 갯수보다 많이 입력함.');
		}

		const totalMoney = cnt * stock.value;

		let averageValue = 0;
		let totalCnt = cnt;
		// 예전에 사고판적이 있을 때
		if (myStock) {
			averageValue = myStock.value;
			// 팔 때면 수량의 차이만 있어야한다. 평단가가 바뀌면 안됨.
			if (totalMoney > 0) {
				averageValue = Math.floor(
					(myStock.cnt * myStock.value + totalMoney) / (myStock.cnt + cnt),
				);
				averageValue = myStock.cnt + cnt !== 0 ? averageValue : 0;
				myStock.value = averageValue;
			}
			totalCnt += myStock.cnt;
			myStock.cnt += cnt;
		} else {
			// 처음 사거나 데이터가 들어있지 않는 경우
			averageValue = stock.value;
			user.stockList.push({ stock: stock, cnt, value: averageValue });
		}

		await this.userModel.updateStockAndMoney(
			user.getId(),
			{ cnt: totalCnt, name: stock.name, value: averageValue },
			user.money,
		);
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

	async updateWeaponAndUserMoney(
		user: IUser,
		myWeapon: TUserWeaponInfo,
		enhanceResult: TEnhanceSimulateResult,
		option?: Partial<{ isPreventDestroy: boolean; isPreventDown: boolean }>,
	) {
		const beforePower = myWeapon.curPower;
		const { code, cost } = enhanceResult;
		if (user.money - cost < 0) {
			throw Error('강화에 필요한 돈이 부족합니다');
		}
		if (code === 2) {
			if (option && !option.isPreventDown && beforePower > 0) {
				myWeapon.curPower -= 1;
			}
			myWeapon.failCnt += 1;
		}
		// 터짐
		else if (code === 3) {
			if (option && !option.isPreventDestroy) {
				myWeapon.curPower = 0;
			}
			myWeapon.destroyCnt += 1;
		} else {
			myWeapon.curPower += 1;
			myWeapon.successCnt += 1;
		}

		await this.userModel.updateWeaponAndMoney(user.getId(), myWeapon, user.money - cost);
	}
}

export default UserService;
