export const numberUtil = new (class Util {
	/** miin <= x < min + len */
	getRandomNumber(len: number, min = 0): number {
		return Math.floor(Math.random() * len) + min;
	}

	setComma(num: string | number, isRemoveDecimal: boolean): string {
		if (!num) {
			return '0';
		}
		num = isRemoveDecimal ? Math.floor(Number(num)) : Number(num);
		num = num.toString();
		return num.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
	}
})();

export default { numberUtil };
