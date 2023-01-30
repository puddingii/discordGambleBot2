import Sword from './Sword';

type WeaponInfo = {
	sword: Sword;
};

export default class WeaponManager {
	weaponInfo: WeaponInfo;

	constructor(weaponInfo: WeaponInfo) {
		this.weaponInfo = weaponInfo;
	}

	getBaseMoney(type: 'sword') {
		const weapon = this.getInfo(type);
		return weapon.baseMoney;
	}

	getInfo(type: 'sword') {
		const weapon = this.weaponInfo[type];
		if (!weapon) {
			throw Error('해당하는 무기가 없습니다.');
		}
		return weapon;
	}

	/** 다음 강화할 때 확률 */
	getNextRatio({ type, curPower }: { type: 'sword'; curPower: number }) {
		const { ratioList, isOverMaxPower } = this.getInfo(type);
		if (isOverMaxPower(curPower)) {
			throw Error('더이상 강화할 수 없습니다.');
		}
		const ratio = ratioList[curPower];
		return {
			success: 1 - (ratio.destroyRatio + ratio.failRatio),
			fail: ratio.failRatio,
			destroy: ratio.destroyRatio,
		};
	}

	getRatioList(type: 'sword') {
		const weapon = this.getInfo(type);
		return weapon.ratioList;
	}
}
