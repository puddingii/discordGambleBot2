import { injectable } from 'inversify';
import { IFormatter } from '../../interfaces/common/util/formatter';

@injectable()
class Formatter implements IFormatter {
	private TIME_TYPE: ['s', 'm', 'h'];
	constructor() {
		this.TIME_TYPE = ['s', 'm', 'h'];
	}

	convertSecond(value: number, depth = 0): { type: string; value: number } {
		if (depth > 2 || value < 0 || (value >= 24 && depth === 2)) {
			throw Error('입력값이 잘못되거나 시간단위를 초과하는 값입니다.');
		}
		if (value < 60 || (value < 24 && depth === 2)) {
			return { type: this.TIME_TYPE[depth], value: value };
		}
		return this.convertSecond(Math.floor(value / 60), depth + 1);
	}

	getRandomNumber(len: number, min = 0): number {
		return Math.floor(Math.random() * len) + min;
	}

	setComma(num: string | number, isRemoveDecimal?: boolean): string {
		if (!num) {
			return '0';
		}
		num = isRemoveDecimal ? Math.floor(Number(num)) : Number(num);
		num = num.toString();
		return num.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
	}
}

export default Formatter;
