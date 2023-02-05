import _ from 'lodash';
import { startSession } from 'mongoose';
import { setComma } from '../../config/util';
import DataManager from '../../game/DataManager';
import { WeaponConstructor } from '../../game/Weapon/Weapon';
import WeaponModel from '../../model/Weapon';
import UserModel from '../../model/User';

const dataManager = DataManager.getInstance();

type FormattedRatioList = Array<{ value: string; name: string }>;

/** 무기종류 추가 */
export const addWeapon = async (param: WeaponConstructor) => {
	const weaponManager = dataManager.get('weapon');
	const weapon = weaponManager.addWeapon(param);

	const session = await startSession();
	await session.withTransaction(async () => {
		const weaponResult = await WeaponModel.addWeapon(weapon);
		if (weaponResult.code === 0) {
			throw Error(weaponResult?.message ?? 'error');
		}
		await UserModel.addNewWeapon(weapon.type);
	});
	await session.endSession();
};

/** 내 무기들 가져오기 */
export const getMyWeapon = ({ discordId, type }: { discordId: string; type: string }) => {
	const userManager = dataManager.get('user');
	return userManager.getMyWeapon({ discordId, type });
};

/** 무기 가져오기 */
export const getWeapon = (type: string) => {
	const weaponManager = dataManager.get('weapon');
	return weaponManager.getInfo({ type });
};

/** 무기 업데이트 */
export const updateWeapon = async (param: WeaponConstructor) => {
	const weaponManager = dataManager.get('weapon');

	weaponManager.updateWeapon({ type: param.type }, param);
	await WeaponModel.updateWeapon(param);
};

/** 모든 무기 다 가져오기 */
export const getAllWeapon = () => {
	const weaponManager = dataManager.get('weapon');
	return weaponManager.weaponList;
};

/** 타입에 해당하는 무기정보 class 리턴 */
export const getWeaponInfo = (type: string) => {
	const weaponManager = dataManager.get('weapon');
	return weaponManager.getBaseMoney({ type });
};

/** perCnt를 기준으로 나눠서 Ratio 설명표를 리턴함 */
export const getFormattedRatioList = (
	type: string,
	perCnt: number,
): FormattedRatioList => {
	const weaponManager = dataManager.get('weapon');
	const myWeapon = weaponManager.getInfo({ type });
	const list = myWeapon.ratioList;
	const listLen = list.length;
	const resultList: FormattedRatioList = [];
	for (let i = 0; i < listLen; i += perCnt) {
		let value = '';
		for (let j = i; j < i + perCnt && j < listLen; j++) {
			const fail = _.round(list[j].failRatio * 100, 2);
			const destroy = _.round(list[j].destroyRatio * 100, 2);
			const success = _.round(100 - destroy - fail, 2);
			const money = myWeapon.getCost(j);
			value = `${value}\n${j}~${j + 1}: (${success}%/${fail}%/${destroy}%)-${setComma(
				money,
				true,
			)}원`;
		}
		resultList.push({
			value,
			name: `${i}~${i + perCnt >= listLen ? listLen : i + perCnt}강`,
		});
	}

	return resultList;
};

/** 다음 강화확률 반환 */
export const getNextRatio = ({
	type,
	discordId,
}: {
	type: string;
	discordId: string;
}) => {
	const userWeapon = getMyWeapon({ discordId, type });
	const weaponManager = dataManager.get('weapon');
	const curPower = userWeapon?.curPower ?? 0;

	return weaponManager.getNextRatio({ type }, curPower);
};

export default {
	addWeapon,
	getFormattedRatioList,
	getNextRatio,
	getMyWeapon,
	getWeapon,
	updateWeapon,
	getAllWeapon,
};
