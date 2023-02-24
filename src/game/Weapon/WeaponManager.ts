import { getRandomNumber } from '../../config/util';
import { TUserWeaponInfo } from '../../interfaces/game/user';
import { TWeaponConstructor } from '../../interfaces/game/weapon';
import Weapon from './Weapon';

type DataInfo = {
	weaponList: Array<Weapon>;
};

type IEnhanceWeaponResult = {
	/** 1: 성공, 2: 실패, 3: 터짐 */
	code?: 1 | 2 | 3;
	curPower: number;
} & Partial<Omit<TUserWeaponInfo, 'weapon'>>;

type WeaponParam = Partial<{
	weapon: Weapon;
	type: string;
}>;

type ValueOf<T> = T[keyof T];

export default class WeaponManager {
	weaponList: DataInfo['weaponList'];

	constructor(dataInfo: DataInfo) {
		this.weaponList = dataInfo.weaponList;
	}

	/** 주식 추가 */
	addWeapon(weaponParam: TWeaponConstructor) {
		const isExistStock = this.weaponList.find(
			weaponInfo => weaponInfo.type === weaponParam.type,
		);
		if (isExistStock) {
			throw Error('이미 있는 무기입니다.');
		}
		const weapon = new Weapon(weaponParam);
		this.weaponList.push(weapon);
		return weapon;
	}

	/** 무기강화 */
	enhanceWeapon(
		weaponParam: WeaponParam,
		curPower: number,
		option?: Partial<{ isPreventDestroy: boolean; isPreventDown: boolean }>,
	): IEnhanceWeaponResult {
		const weaponInfo = this.getInfo(weaponParam);
		if (!weaponInfo.isValidPower(curPower + 1)) {
			throw Error('더이상 강화할 수 없습니다.');
		}

		const MAX_NUMBER = 1000;
		const randomNum = getRandomNumber(MAX_NUMBER, 1);
		const { failRatio, destroyRatio } = weaponInfo.ratioList[curPower];
		// 실패
		if (failRatio * MAX_NUMBER >= randomNum) {
			if (option && !option.isPreventDown && curPower > 0) {
				curPower -= 1;
			}
			return { code: 2, curPower, failCnt: 1 };
		}
		// 터짐
		if (
			(failRatio + destroyRatio) * MAX_NUMBER >= randomNum &&
			option &&
			!option.isPreventDestroy
		) {
			return { code: 3, curPower: 0, destroyCnt: 1 };
		}

		// 성공
		return {
			code: 1,
			curPower: curPower + 1,
			successCnt: 1,
		};
	}

	getBaseMoney(weaponParam: WeaponParam) {
		const weapon = this.getInfo(weaponParam);
		return weapon.baseMoney;
	}

	getInfo({ type, weapon }: WeaponParam) {
		if (weapon) {
			return weapon;
		}
		const weaponInfo = this.weaponList.find(w => w.type === type);
		if (!weaponInfo) {
			throw Error('해당하는 무기가 없습니다.');
		}
		return weaponInfo;
	}

	getRatioList(weaponParam: WeaponParam) {
		const weapon = this.getInfo(weaponParam);
		return weapon.ratioList;
	}

	updateWeapon(weaponParam: WeaponParam, updatedWeaponInfo: Partial<TWeaponConstructor>) {
		const weaponInfo = this.getInfo(weaponParam);
		(Object.keys(updatedWeaponInfo) as Array<keyof typeof updatedWeaponInfo>).forEach(
			info => {
				if (info !== 'type' && info !== 'name') {
					(<ValueOf<Weapon>>weaponInfo[info]) = updatedWeaponInfo[info];
				}
			},
		);
	}
}
