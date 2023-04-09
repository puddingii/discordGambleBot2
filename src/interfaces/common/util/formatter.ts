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
	convertSecond(value: number, depth?: number): { type: string; value: number };
	/**
	 * min <= x < min + len
	 * @example
	 * getRandomNumber(5) // 0 <= x < 5
	 * getRandomNumber(5, 3) // 3 <= x < 8
	 */
	getRandomNumber(len: number, min?: number): number;
	/**
	 * @example
	 * setComma(1000000) // 1,000,000
	 * setComma(1000000.123) // 1,000,000.123
	 * setComma(1000000.123, true) // 1,000,000
	 */
	setComma(num: string | number, isRemoveDecimal?: boolean): string;
}
