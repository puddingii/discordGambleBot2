import { inject, injectable } from 'inversify';
import { Types } from 'mongoose';
import _ from 'lodash';
import pwGenerator from 'generate-password';
import TYPES from '../../interfaces/containerType';
import {
	IUserService,
	TPopulatedList,
	TProcessedStockInfo,
	TUserParam,
} from '../../interfaces/common/services/userService';
import User from '../game/User/User';
import Stock from '../game/Stock/Stock';
import Weapon from '../game/Weapon/Weapon';
import {
	IUser,
	TPopulatedUserWeaponInfo,
	TUserGiftInfo,
} from '../../interfaces/game/user';
import { IStock2 } from '../../interfaces/game/stock';
import { IWeapon } from '../../interfaces/game/weapon';
import { TEnhanceSimulateResult } from '../../interfaces/common/services/weaponService';
import { TUserModelInfo } from '../../interfaces/model/user';

@injectable()
class UserService implements IUserService {
	userModel: IUserService['userModel'];

	constructor(@inject(TYPES.UserModel) userModel: IUserService['userModel']) {
		this.userModel = userModel;
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
			const {
				weapon,
				bonusPower,
				curPower,
				destroyCnt,
				failCnt,
				hitRatio,
				missRatio,
				successCnt,
			} = weaponInfo;
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
			return {
				bonusPower,
				curPower,
				destroyCnt,
				failCnt,
				hitRatio,
				missRatio,
				successCnt,
				weapon: myWeapon,
			};
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
				let myRatio = 0;
				const stock = myStock.stock;
				const { cnt: myCnt, value: myAvgValue } = myStock;

				if (myCnt > 0) {
					myRatio = _.round((stock.value / myAvgValue) * 100 - 100, 2);
					// 내가 가지고 있는 주식 갯수로 평균 매수위치 알기(내 평균값, 주식값)
					acc.totalMyValue += myCnt * myAvgValue;
					acc.totalStockValue += myCnt * stock.value;
				}

				// 내 주식 정보
				acc.stockList.push({
					name: stock.name,
					cnt: myCnt,
					myValue: myAvgValue ?? 0,
					myRatio,
					stockValue: stock.value,
					stockType: stock.type,
					profilMargin: myCnt * (stock.value - myAvgValue),
					holdingRatio: 0,
				});

				return acc;
			},
			{
				stockList: [],
				totalMyValue: 0,
				totalStockValue: 0,
				totalMyMoney: user.money,
			},
		);

		// 각각의 주식의 가치비중 계산
		stockInfo.stockList = stockInfo.stockList.map(stock => {
			const holdingRatio = _.round(
				((stock.cnt * stock.myValue) / stockInfo.totalMyValue) * 100,
				2,
			);
			return { ...stock, holdingRatio };
		});

		return stockInfo;
	}

	async addGift(user: IUser, giftInfo: TUserGiftInfo) {
		user.giftList.push(giftInfo);
		await this.userModel.addGift({ discordId: user.getId() }, giftInfo);
	}

	async addGiftList(user: IUser, giftList: Array<TUserGiftInfo>) {
		user.giftList.push(...giftList);
		await this.userModel.addGiftList({ discordId: user.getId() }, giftList);
	}

	async addStock(stock: IStock2) {
		await this.userModel.addNewStock(stock.name);
	}

	async addUser({ id, nickname }: { id: string; nickname: string }) {
		const isExistedId = await this.userModel.exists({ discordId: id });
		if (isExistedId) {
			throw Error('이미 등록된 아이디입니다');
		}
		const isExistedNickname = await this.userModel.exists({ nickname });
		if (isExistedNickname) {
			throw Error('이미 등록된 닉네임입니다');
		}
		await this.userModel.addNewUser(id, nickname);
	}

	async addWeapon(weapon: IWeapon) {
		await this.userModel.addNewWeapon(weapon.type);
	}

	async generatePassword(discordId: string): Promise<string> {
		const myPassword = pwGenerator.generate({ length: 12, numbers: true });
		await this.userModel.updatePassword(discordId, myPassword);
		return myPassword;
	}

	async getAllUser(populatedList?: TPopulatedList) {
		const userList = await this.userModel.getAllUserList(populatedList);

		return userList.map(user => {
			return this.convertDataToClass(user);
		});
	}

	async getReceivedAllGiftMoney(user: IUser): Promise<number> {
		const money = await this.userModel.getReceivedAllGiftMoney({
			discordId: user.getId(),
		});
		return money;
	}

	async getUser(userParam: TUserParam, populatedList?: TPopulatedList) {
		const userInfo = await this.userModel.findByUserInfo(userParam, populatedList);
		const user = this.convertDataToClass(userInfo);

		return user;
	}

	async receiveAllGiftMoney(userParam: TUserParam): Promise<number> {
		const totalMoney = await this.userModel.convertGiftListToMoney(userParam);
		return totalMoney;
	}

	async tradeStock(user: IUser, stock: IStock2, cnt: number, isFull: boolean) {
		const myStock = user.getStock(stock.name);
		if (isFull) {
			cnt = cnt > 0 ? Math.floor(user.money / stock.value) : (myStock?.cnt ?? 0) * -1;
		}
		if (!cnt || user.money < stock.value * cnt) {
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

		let extraCommission = 1;
		// 주식이고 파는 경우 수수료 2%를 땐다.
		if (totalMoney < 0 && myStock?.stock.type === 'stock') {
			extraCommission = 0.98;
		}
		user.money -= totalMoney * extraCommission;

		await this.userModel.updateStockAndMoney(
			user.getId(),
			{ cnt: totalCnt, name: stock.name, value: averageValue },
			user.money,
		);

		return { cnt: totalCnt, value: averageValue };
	}

	async updateMoney(user: IUser, money: number) {
		if (user.money + money < 0) {
			throw Error('돈이 부족함');
		}
		user.money += money;

		await this.userModel.updateMoney({ discordId: user.getId() }, user.money);
	}

	async updateWeaponAndUserMoney(
		user: IUser,
		myWeapon: TPopulatedUserWeaponInfo,
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
