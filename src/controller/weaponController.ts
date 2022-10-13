import DataManager from '../game/DataManager';
import Sword from '../game/Weapon/Sword';
import dependency from '../config/dependencyInjection';

const {
	cradle: {
		util: { getRandomNumber },
	},
} = dependency;

const dataManager = DataManager.getInstance();
const weaponManager = dataManager.get('weapon');
const userManager = dataManager.get('user');

type EnhanceWeaponType = {
	/** 1: 성공, 2: 실패, 3: 터짐 */
	code: 1 | 2 | 3;
	myWeapon: Sword;
	money: number;
};

/** 무기강화 */
export const enhanceWeapon = ({
	userId,
	type,
	isPreventDestroy = false,
	isPreventDown = false,
}: {
	userId: string;
	type: 'sword';
	isPreventDestroy: boolean;
	isPreventDown: boolean;
}): EnhanceWeaponType => {
	const userInfo = userManager.getUser({ discordId: userId });
	if (!userInfo) {
		throw Error('유저정보가 없습니다');
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

	if (myWeapon.curPower >= 30) {
		throw Error('더이상 강화할 수 없습니다.');
	}

	// 강화비용 계산
	let cost = weaponManager
		.getRatioList(type)
		.slice(0, myWeapon.curPower + 1)
		.reduce((acc, cur) => {
			return acc * cur.moneyRatio;
		}, weaponManager.getDefaultValue(type));
	cost += (isPreventDestroy ? cost * 2 : 0) + (isPreventDown ? cost : 0);

	userInfo.updateMoney(-1 * cost, 'weapon');

	const MAX_NUMBER = 1000;
	const money = userInfo.money;
	const randomNum = getRandomNumber(MAX_NUMBER, 1);
	const { failRatio, destroyRatio } = weaponManager.getRatioList(type)[myWeapon.curPower];
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
};

export default {
	enhanceWeapon,
};
