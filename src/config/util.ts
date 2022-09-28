/** min <= x < min + len */
export const getRandomNumber = (len: number, min = 0): number => {
	return Math.floor(Math.random() * len) + min;
};

export const setComma = (num: string | number, isRemoveDecimal: boolean): string => {
	if (!num) {
		return '0';
	}
	num = isRemoveDecimal ? Math.floor(Number(num)) : Number(num);
	num = num.toString();
	return num.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
};

export default { getRandomNumber, setComma };
