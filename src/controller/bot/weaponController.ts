import _ from 'lodash';
import { startSession } from 'mongoose';
import { getRandomNumber, setComma } from '../../config/util';
import DataManager from '../../game/DataManager';
import Sword, { SwordConstructor } from '../../game/Weapon/Sword';
import WeaponModel from '../../model/Weapon';
import UserModel from '../../model/User';

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

/** 무기 가져오기 */
export const getWeapon = (type: 'sword') => {
	const weaponManager = dataManager.get('weapon');
	return weaponManager.getInfo(type);
};

/** 무기 업데이트 + 새로만들기 */
export const updateWeapon = async (isNew: boolean, param: SwordConstructor) => {
	const weaponManager = dataManager.get('weapon');
	if (isNew) {
		const weapon = new Sword(param);
		weaponManager.addWeapon(weapon);
		const session = await startSession();
		await session.withTransaction(async () => {
			const weaponResult = await WeaponModel.addWeapon(weapon);
			if (weaponResult.code === 0) {
				throw Error(weaponResult?.message ?? 'error');
			}
			await UserModel.addNewWeapon(weapon.type);
		});
		await session.endSession();
		return;
	}

	const weapon = weaponManager.getInfo(param.type);
	if (!weapon) {
		throw Error(`해당하는 type의 무기가 없습니다.`);
	}

	weapon.comment = param.comment;
	weapon.baseMoney = param.baseMoney;
	weapon.enhanceCost = param.enhanceCost;
	weapon.maxPower = param.maxPower;
	weapon.powerMultiple = param.powerMultiple;
	weapon.ratioList = param.ratioList;
	await WeaponModel.updateWeapon(param);
};

/** 모든 무기 다 가져오기 */
export const getAllWeapon = () => {
	const weaponManager = dataManager.get('weapon');
	return weaponManager.weaponList;
};

/** 타입에 해당하는 무기정보 class 리턴 */
export const getWeaponInfo = (type: 'sword') => {
	const weaponManager = dataManager.get('weapon');
	return weaponManager.getBaseMoney(type);
};

/** perCnt를 기준으로 나눠서 Ratio 설명표를 리턴함 */
export const getFormattedRatioList = (
	type: 'sword',
	perCnt: number,
): FormattedRatioList => {
	const weaponManager = dataManager.get('weapon');
	const myWeapon = weaponManager.getInfo(type);
	const list = myWeapon.ratioList;
	const resultList: FormattedRatioList = [];
	for (let i = 0; i < Math.floor(list.length / perCnt); i++) {
		let value = '';
		for (let j = i * perCnt; j < (i + 1) * perCnt; j++) {
			const fail = _.round(list[j].failRatio * 100, 2);
			const destroy = _.round(list[j].destroyRatio * 100, 2);
			const success = _.round(100 - destroy - fail, 2);
			const money = myWeapon.getCost(j);
			value = `${value}\n${j}~${j + 1}: (${success}%/${fail}%/${destroy}%)-${setComma(
				money,
				true,
			)}원`;
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
export const enhanceWeapon = async ({
	discordId,
	type,
	isPreventDestroy = false,
	isPreventDown = false,
}: {
	discordId: string;
	type: 'sword';
	isPreventDestroy: boolean;
	isPreventDown: boolean;
}): Promise<EnhanceWeaponType> => {
	const userManager = dataManager.get('user');
	const weaponManager = dataManager.get('weapon');
	const weaponInfo = weaponManager.getInfo(type);
	const userInfo = userManager.getUser({ discordId });
	if (!userInfo) {
		throw Error('유저정보가 없습니다');
	}
	const myWeapon = userInfo.weaponList.find(weapon => weapon.weapon.type === type);
	if (!myWeapon) {
		throw Error('무기정보가 없습니다.');
	}

	const beforePower = myWeapon.curPower;
	if (myWeapon.curPower >= 30) {
		throw Error('더이상 강화할 수 없습니다.');
	}

	// 강화비용 계산
	let cost = weaponInfo.getCost(myWeapon.curPower);
	cost += (isPreventDestroy ? cost * 2 : 0) + (isPreventDown ? cost * 10 : 0);

	userInfo.updateMoney(-1 * cost, 'weapon');

	const MAX_NUMBER = 1000;
	const randomNum = getRandomNumber(MAX_NUMBER, 1);
	const { failRatio, destroyRatio } = weaponInfo.ratioList[myWeapon.curPower];
	let result: EnhanceWeaponType;
	// 실패
	if (failRatio * MAX_NUMBER >= randomNum) {
		myWeapon.failCnt++;
		if (!isPreventDown && myWeapon.curPower > 0) {
			myWeapon.curPower--;
		}
		result = { code: 2, curPower: myWeapon.curPower, beforePower };
	}
	// 터짐
	else if ((failRatio + destroyRatio) * MAX_NUMBER >= randomNum) {
		if (!isPreventDestroy) {
			myWeapon.curPower = 0;
			myWeapon.destroyCnt++;
		}
		result = { code: 3, curPower: myWeapon.curPower, beforePower };
	}

	// 성공
	else {
		myWeapon.curPower++;
		myWeapon.successCnt++;
		result = { code: 1, curPower: myWeapon.curPower, beforePower };
	}
	await userManager.update({ type: 'wm', userInfo, optionalInfo: myWeapon });
	return result;
};

export default {
	enhanceWeapon,
	getFormattedRatioList,
	getNextRatio,
	getMyWeapon,
	getWeapon,
	updateWeapon,
	getAllWeapon,
};
