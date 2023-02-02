type ToolInfo = {
	type: 'sword';
	comment: string;
	powerMultiple: number;
	enhanceCost: number;
	baseMoney: number;
	ratioList: Array<{ failRatio: number; destroyRatio: number }>;
	maxPower: number;
};

export type ToolConstructor = Omit<ToolInfo, 'comment'> &
	Pick<Partial<ToolInfo>, 'comment'>;

export default abstract class ToolAbstract {
	baseMoney: ToolInfo['baseMoney'];
	comment?: ToolInfo['comment'];
	enhanceCost: ToolInfo['enhanceCost'];
	maxPower: ToolInfo['maxPower'];

	powerMultiple: ToolInfo['powerMultiple'];
	ratioList: ToolInfo['ratioList'];
	type: ToolInfo['type'];

	constructor({
		powerMultiple,
		enhanceCost,
		baseMoney,
		comment,
		type,
		ratioList,
		maxPower,
	}: ToolConstructor) {
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
