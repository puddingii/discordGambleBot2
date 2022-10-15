import _ from 'lodash';
import Stock from '../Stock/Stock';
import Coin from '../Stock/Coin';
import Weapon from '../Weapon/Sword';
import User from './User';

/** Class Constructor Param Type */
export interface MyStockInfo {
	stockList: Array<{
		name: string;
		cnt: number;
		myRatio: number;
		myValue: number;
		stockValue: number;
		stockType: 'stock' | 'coin';
		stockBeforeRatio: number;
	}>;
	totalMyValue: number;
	totalStockValue: number;
}

export default class UserManager {
	userList: Array<User>;

	constructor(userList: Array<User>) {
		this.userList = userList;
	}

	/** 유저등록 */
	addUser(userInfo: User) {
		const isExistUser = this.getUser({ discordId: userInfo.getId() });
		if (isExistUser) {
			throw Error('이미 있는 유저입니다.');
		}
		this.userList.push(userInfo);
	}

	/** 내가 가지고 있는 주식리스트 */
	getMyStockList(discordId: string): MyStockInfo {
		const user = this.getUser({ discordId });
		if (!user) {
			throw Error('유저정보를 찾을 수 없습니다.');
		}

		const stockInfo = user.stockList.reduce(
			(acc: MyStockInfo, myStock) => {
				if (myStock.cnt > 0) {
					const myRatio = _.round((myStock.stock.value / myStock.value) * 100 - 100, 2);
					acc.stockList.push({
						name: myStock.stock.name,
						cnt: myStock.cnt,
						myValue: myStock.value,
						myRatio,
						stockValue: myStock.stock.value,
						stockType: myStock.stock.type,
						stockBeforeRatio: _.round(myStock.stock.beforeHistoryRatio * 100, 2),
					});
					acc.totalMyValue += myStock.cnt * myStock.value;
					acc.totalStockValue += myStock.cnt * myStock.stock.value;
				}
				return acc;
			},
			{ stockList: [], totalMyValue: 0, totalStockValue: 0 },
		);

		return stockInfo;
	}

	/** 내가 가지고 있는 무기 반환 */
	getMyWeaponList({ discordId, type }: { discordId: string; type: 'sword' }) {
		const user = this.getUser({ discordId });
		if (!user) {
			throw Error('유저정보를 찾을 수 없습니다.');
		}

		return user.getWeapon(type);
	}

	/** 디스코드 아이디를 가지고 유저클래스 찾기 */
	getUser({
		discordId,
		nickname,
	}: Partial<{
		discordId: string;
		nickname: string;
	}>): User | undefined {
		if (discordId) {
			return this.userList.find(userInfo => userInfo.getId() === discordId);
		}
		return this.userList.find(userInfo => userInfo.nickname === nickname);
	}

	/** 유저리스트 가져오기 */
	getUserList(): Array<User> {
		return this.userList;
	}
}
