import Stock from '../Stock';

export default class Condition {
	stock: Stock;
	constructor(stock: Stock) {
		this.stock = stock;
	}

	getRandomRatio(): number {
		const randomRatio = this.stock.getRandomRatio();
		return randomRatio + (this.stock.beforeHistoryRatio > 0 ? -0.03 : 0.03);
	}
}
