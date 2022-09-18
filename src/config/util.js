module.exports = new (class {
	/**
	 * min <= x < min + len
	 * @param {number} len
	 * @param {number} min
	 */
	getRandomNumber(len, min = 0) {
		return Math.floor(Math.random() * len) + min;
	}
	/**
	 * 세자리수마다 컴마 찍어주기
	 * @param {string | number} num
	 * @param {boolean} isRemoveDecimal
	 * @return {string}
	 */
	setComma(num, isRemoveDecimal) {
		if (!num) {
			return 0;
		}
		num = isRemoveDecimal ? Math.floor(Number(num)) : Number(num);
		num = num.toString();
		return num.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
	}
})();
