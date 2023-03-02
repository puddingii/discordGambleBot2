import { injectable } from 'inversify';

type TIME_TYPE = ['s', 'm', 'h'];

export interface IFormatter {
	/**
	 * 크론에서 사용할 초 컨버트작업
	 * @example
	 * convertSecond(-3) // Error
	 * convertSecond(30) // { type: 's', value: 30 }
	 * convertSecond(190) // { type: 'm', value: 3 }
	 * convertSecond(3700) // { type: 'h', value: 1 }
	 * convertSecond(86400) // Error
	 */
	convertSecond(value: number, depth: number): { type: string; value: number };
	/**
	 * min <= x < min + len
	 * @example
	 * getRandomNumber(5) // 0 <= x < 5
	 * getRandomNumber(5, 3) // 3 <= x < 8
	 */
	getRandomNumber(len: number, min: number): number;
	/**
	 * @example
	 * setComma(1000000) // 1,000,000
	 * setComma(1000000.123) // 1,000,000.123
	 * setComma(1000000.123, true) // 1,000,000
	 */
	setComma(num: string | number, isRemoveDecimal?: boolean): string;
}

@injectable()
class Formatter implements IFormatter {
	private TIME_TYPE: TIME_TYPE;
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
