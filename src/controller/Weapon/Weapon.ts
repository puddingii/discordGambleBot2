import Game from '../Game';
import Sword from './Sword';
import dependency from '../../config/dependencyInjection';

const {
	cradle: {
		util: {
			numberUtil: { getRandomNumber },
		},
	},
} = dependency;

interface DefaultResult {
	code: number;
	message?: string;
}

interface EnhanceWeaponType extends DefaultResult {
	myWeapon?: Sword;
	money?: number;
}

export default class Weapon {
	swordInfo: {
		ratioList: { moneyRatio: number; failRatio: number; destroyRatio: number }[];
		value: number;
	};

	constructor() {
		const section1 = Array.from({ length: 10 }, (v, i) => ({
			moneyRatio: 1.1,
			failRatio: 0.05 * i,
			destroyRatio: 0,
		}));
		this.swordInfo = {
			ratioList: [
				...section1,
				{ moneyRatio: 1.15, failRatio: 0.5, destroyRatio: 0 }, // 10 -> 11
				{ moneyRatio: 1.15, failRatio: 0.55, destroyRatio: 0 },
				{ moneyRatio: 1.15, failRatio: 0.6, destroyRatio: 0.006 },
				{ moneyRatio: 1.15, failRatio: 0.6, destroyRatio: 0.013 },
				{ moneyRatio: 1.15, failRatio: 0.65, destroyRatio: 0.014 }, // 14 -> 15
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.02 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.03 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.04 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.05 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.06 }, // 19 -> 20
				{ moneyRatio: 1.2, failRatio: 0.75, destroyRatio: 0.07 },
				{ moneyRatio: 1.2, failRatio: 0.75, destroyRatio: 0.07 },
				{ moneyRatio: 1.2, failRatio: 0.8, destroyRatio: 0.08 },
				{ moneyRatio: 1.2, failRatio: 0.85, destroyRatio: 0.09 },
				{ moneyRatio: 1.2, failRatio: 0.89, destroyRatio: 0.1 }, // 24 -> 25
			],
			value: 3000,
		};
	}

	/** 무기강화 */
	enhanceWeapon(
		userId: string,
		type: 'sword',
		isPreventDestroy = false,
		isPreventDown = false,
	): EnhanceWeaponType {
		const userInfo = Game.getUser({ discordId: userId });
		if (!userInfo) {
			return { code: 0, message: '유저정보가 없습니다' };
		}
		let myWeapon = userInfo.weaponList.find(weapon => weapon.type === type);
		if (!myWeapon) {
			switch (type) {
				case 'sword':
					myWeapon = new Sword();
					break;
				default:
					myWeapon = new Sword();
			}
			userInfo.weaponList.push(myWeapon);
		}

		// 강화비용 계산
		let cost = this[`${type}Info`].ratioList
			.slice(0, myWeapon.curPower + 1)
			.reduce((acc, cur) => {
				return acc * cur.moneyRatio;
			}, this[`${type}Info`].value);
		cost += (isPreventDestroy ? cost * 2 : 0) + (isPreventDown ? cost : 0);

		const moneyResult = userInfo.updateMoney(-1 * cost, 'weapon');
		if (!moneyResult.code) {
			return moneyResult;
		}

		const MAX_NUMBER = 1000;
		const money = userInfo.money;
		const randomNum = getRandomNumber(MAX_NUMBER, 1);
		const { failRatio, destroyRatio } = this[`${type}Info`].ratioList[myWeapon.curPower];
		// 실패
		if (failRatio * MAX_NUMBER >= randomNum) {
			myWeapon.failCnt++;
			if (!isPreventDown && myWeapon.curPower > 0) {
				myWeapon.curPower--;
			}
			return { code: 2, myWeapon, money };
		}
		// 터짐
		if ((failRatio + destroyRatio) * MAX_NUMBER >= randomNum) {
			if (!isPreventDestroy) {
				myWeapon.curPower = 0;
				myWeapon.destroyCnt++;
			}
			return { code: 3, myWeapon, money };
		}

		myWeapon.curPower++;
		myWeapon.successCnt++;
		return { code: 1, myWeapon, money };
	}
}
