import { ICoin } from '../../../interfaces/game/stock';
import StockAbstract from './StockAbstract';

export default class Coin extends StockAbstract<'coin'> implements ICoin {
	update(curTime: number): { code: number } {
		const ratio = this.getRandomRatio();
		if (this.isUpdateTime(curTime)) {
			return { code: 0 };
		}

		this.beforeHistoryRatio = ratio;
		this.value *= 1 + ratio;
		return { code: 1 };
	}
}
