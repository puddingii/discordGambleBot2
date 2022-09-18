module.exports = class Condition {
	/**
	 * @param {import('../Stock')} stock
	 */
	constructor(stock) {
		this.stock = stock;
	}

	getRandomRatio() {
		const randomRatio = this.stock.getRandomRatio();
		return randomRatio + (this.stock.beforeHistoryRatio > 0 ? -0.03 : 0.03);
	}
};
