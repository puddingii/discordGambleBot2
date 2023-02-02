type WeaponInfo = {
	type: string;
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

	powerMultiple: WeaponInfo['powerMultiple'];
	ratioList: WeaponInfo['ratioList'];
	type: WeaponInfo['type'];

	constructor({
		powerMultiple,
		enhanceCost,
		baseMoney,
		comment,
		type,
		ratioList,
		maxPower,
	}: WeaponConstructor) {
		this.type = type;
		this.powerMultiple = powerMultiple;
		this.enhanceCost = enhanceCost;
		this.baseMoney = baseMoney;
		this.comment = comment ?? '';
		this.ratioList = ratioList;
		this.maxPower = maxPower;
	}

	getCost(exponent: number) {
		if (exponent < 0) {
			throw Error('0이하의 값은 입력할 수 없습니다.');
		}
		return (this.baseMoney ** (exponent - 10) + 1) * this.enhanceCost;
	}

	getPower(power: number) {
		if (power < 0) {
			throw Error('0이하의 값은 입력할 수 없습니다.');
		}
		return power * this.powerMultiple;
	}

	isOverMaxPower(power: number) {
		return this.maxPower <= power;
	}
}
