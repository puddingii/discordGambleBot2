import _ from 'lodash';
import DataManager from '../../game/DataManager';
import Sword from '../../game/Weapon/Sword';
import dependency from '../../config/dependencyInjection';

const {
	cradle: {
		util: { getRandomNumber, setComma },
	},
} = dependency;

const dataManager = DataManager.getInstance();

type EnhanceWeaponType = {
	/** 1: 성공, 2: 실패, 3: 터짐 */
	code: 1 | 2 | 3;
	curPower: number;
	beforePower: number;
};

type FormattedRatioList = Array<{ value: string; name: string }>;

/** 내 무기들 가져오기 */
export const getMyWeapon = ({
	discordId,
	type,
}: {
	discordId: string;
	type: 'sword';
}) => {
	const userManager = dataManager.get('user');
	return userManager.getMyWeapon({ discordId, type });
};

/** 타입에 해당하는 무기정보 class 리턴 */
export const getWeaponInfo = (type: 'sword') => {
	const weaponManager = dataManager.get('weapon');
	return weaponManager.getDefaultValue(type);
};

/** perCnt를 기준으로 나눠서 Ratio 설명표를 리턴함 */
export const getFormattedRatioList = (
	type: 'sword',
	perCnt: number,
): FormattedRatioList => {
	const weaponManager = dataManager.get('weapon');
	const { ratioList: list, value } = weaponManager.getInfo(type);
	let money = value;
	const resultList: FormattedRatioList = [];
	for (let i = 0; i < Math.floor(list.length / perCnt); i++) {
		let value = '';
		for (let j = i * perCnt; j < (i + 1) * perCnt; j++) {
			const fail = _.round(list[j].failRatio * 100, 2);
			const destroy = _.round(list[j].destroyRatio * 100, 2);
			const success = _.round(100 - destroy - fail, 2);
			money *= list[j].moneyRatio;
			value = `${value}\n${i * perCnt + j}~${
				i * perCnt + j + 1
			}: (${success}%/${fail}%/${destroy}%)-${setComma(money, true)}원`;
		}
		resultList.push({ value, name: `${i * perCnt}~${(i + 1) * perCnt}강` });
	}

	return resultList;
};

/** 다음 강화확률 반환 */
export const getNextRatio = ({
	type,
	discordId,
}: {
	type: 'sword';
	discordId: string;
}) => {
	const userWeapon = getMyWeapon({ discordId, type });
	const weaponManager = dataManager.get('weapon');
	const curPower = userWeapon?.curPower ?? 0;

	return weaponManager.getNextRatio({ type, curPower });
};

/** 무기강화 */
export const enhanceWeapon = ({
	discordId,
	type,
	isPreventDestroy = false,
	isPreventDown = false,
}: {
	discordId: string;
	type: 'sword';
	isPreventDestroy: boolean;
	isPreventDown: boolean;
}): EnhanceWeaponType => {
	const userManager = dataManager.get('user');
	const weaponManager = dataManager.get('weapon');
	const userInfo = userManager.getUser({ discordId });
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

	const beforePower = myWeapon.curPower;
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
	cost += (isPreventDestroy ? cost * 2 : 0) + (isPreventDown ? cost * 10 : 0);

	userInfo.updateMoney(-1 * cost, 'weapon');

	const MAX_NUMBER = 1000;
	const randomNum = getRandomNumber(MAX_NUMBER, 1);
	const { failRatio, destroyRatio } = weaponManager.getRatioList(type)[myWeapon.curPower];
	// 실패
	if (failRatio * MAX_NUMBER >= randomNum) {
		myWeapon.failCnt++;
		if (!isPreventDown && myWeapon.curPower > 0) {
			myWeapon.curPower--;
		}
		userManager.pushWaitingUser(userInfo); // FIXME 구조가...영...
		return { code: 2, curPower: myWeapon.curPower, beforePower };
	}
	// 터짐
	if ((failRatio + destroyRatio) * MAX_NUMBER >= randomNum) {
		if (!isPreventDestroy) {
			myWeapon.curPower = 0;
			myWeapon.destroyCnt++;
		}
		userManager.pushWaitingUser(userInfo);
		return { code: 3, curPower: myWeapon.curPower, beforePower };
	}

	// 성공
	myWeapon.curPower++;
	myWeapon.successCnt++;
	userManager.pushWaitingUser(userInfo);
	return { code: 1, curPower: myWeapon.curPower, beforePower };
};

export default {
	enhanceWeapon,
	getFormattedRatioList,
	getNextRatio,
	getMyWeapon,
};
