import Sword from './Sword';

type DataInfo = {
	weaponList: Array<Sword>;
};

export default class WeaponManager {
	weaponList: DataInfo['weaponList'];

	constructor(dataInfo: DataInfo) {
		this.weaponList = dataInfo.weaponList;
	}

	/** 주식 추가 */
	addWeapon<T extends Sword>(weapon: T) {
		const list = this.weaponList;
		const isExistStock = list.find(weaponInfo => weaponInfo.type === weapon.type);
		if (isExistStock) {
			throw Error('이미 있는 무기입니다.');
		}
		list.push(weapon);
	}

	getBaseMoney(type: 'sword') {
		const weapon = this.getInfo(type);
		return weapon.baseMoney;
	}

	getInfo(type: 'sword') {
		const weapon = this.weaponList.find(w => w.type === type);
		if (!weapon) {
			throw Error('해당하는 무기가 없습니다.');
		}
		return weapon;
	}

	/** 다음 강화할 때 확률 */
	getNextRatio({ type, curPower }: { type: 'sword'; curPower: number }) {
		const myWeapon = this.getInfo(type);
		if (myWeapon.isOverMaxPower(curPower)) {
			throw Error('더이상 강화할 수 없습니다.');
		}
		const ratio = myWeapon.ratioList[curPower];
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
