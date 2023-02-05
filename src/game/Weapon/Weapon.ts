type WeaponInfo = {
	type: string;
	name: string;
	comment: string;
	powerMultiple: number;
	enhanceCost: number;
	baseMoney: number;
	ratioList: Array<{ failRatio: number; destroyRatio: number }>;
	maxPower: number;
};

export type WeaponConstructor = Omit<WeaponInfo, 'comment'> &
	Pick<Partial<WeaponInfo>, 'comment'>;

export default class Weapon {
	baseMoney: WeaponInfo['baseMoney'];
	comment?: WeaponInfo['comment'];
	enhanceCost: WeaponInfo['enhanceCost'];
	maxPower: WeaponInfo['maxPower'];

	name: WeaponInfo['name'];
	powerMultiple: WeaponInfo['powerMultiple'];
	ratioList: WeaponInfo['ratioList'];
	type: WeaponInfo['type'];

	constructor({
		powerMultiple,
		enhanceCost,
		baseMoney,
		comment,
		type,
		name,
		ratioList,
		maxPower,
	}: WeaponConstructor) {
		this.type = type;
		this.name = name;
		this.powerMultiple = powerMultiple;
		this.enhanceCost = enhanceCost;
		this.baseMoney = baseMoney;
		this.comment = comment ?? '';
		this.ratioList = ratioList;
		this.maxPower = maxPower;
	}

	getCost(
		exponent: number,
		option?: { isPreventDown?: boolean; isPreventDestroy?: boolean },
	) {
		if (exponent < 0 && exponent >= this.maxPower) {
			throw Error('0미만 및 강화 최대치 이상의 비용은 책정할 수 없습니다');
		}
		let cost = (this.baseMoney ** (exponent - 10) + 1) * this.enhanceCost;
		if (option) {
			const { isPreventDestroy, isPreventDown } = option;
			cost += (isPreventDestroy ? cost * 2 : 0) + (isPreventDown ? cost * 10 : 0);
		}

		return cost;
	}

	getPower(power: number) {
		if (power < 0 && power > this.maxPower) {
			throw Error('0미만 및 강화 최대치 초과의 힘은 책정할 수 없습니다');
		}
		return power * this.powerMultiple;
	}

	isValidPower(power: number) {
		return power <= this.maxPower && power >= 0;
	}
}
