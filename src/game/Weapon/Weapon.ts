import { TWeaponInfo, TWeaponConstructor, IWeapon } from '../../interfaces/game/weapon';

export default class Weapon implements IWeapon {
	baseMoney: TWeaponInfo['baseMoney'];
	comment: TWeaponInfo['comment'];
	enhanceCost: TWeaponInfo['enhanceCost'];
	maxPower: TWeaponInfo['maxPower'];

	name: TWeaponInfo['name'];
	powerMultiple: TWeaponInfo['powerMultiple'];
	ratioList: TWeaponInfo['ratioList'];
	type: TWeaponInfo['type'];

	constructor({
		powerMultiple,
		enhanceCost,
		baseMoney,
		comment,
		type,
		name,
		ratioList,
		maxPower,
	}: TWeaponConstructor) {
		this.type = type;
		this.name = name;
		this.powerMultiple = powerMultiple;
		this.enhanceCost = enhanceCost;
		this.baseMoney = baseMoney;
		this.comment = comment ?? '';
		this.ratioList = ratioList;
		this.maxPower = maxPower;
	}

	getPower(power: number) {
		if (power < 0 && power > this.maxPower) {
			throw Error('0미만 및 강화 최대치 초과의 힘은 책정할 수 없습니다');
		}
		return power * this.powerMultiple;
	}

	getRatio(power: number) {
		if (!this.isValidPower(power)) {
			throw Error('유효하지 않는 파워값입니다');
		}

		return this.ratioList[power];
	}

	isValidPower(power: number) {
		return power <= this.maxPower && power >= 0;
	}
}
