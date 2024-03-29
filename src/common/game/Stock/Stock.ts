import { IStock, TStockConstructor, TStockInfo2 } from '../../../interfaces/game/stock';
import Condition from './ExternalOption/Condition';
import StockAbstract from './StockAbstract';

export default class Stock extends StockAbstract implements IStock {
	conditionList: TStockInfo2['conditionList'];
	dividend: TStockInfo2['dividend'];
	readonly MAX_RATIO = 0.2;

	constructor(info: TStockConstructor) {
		super(info);
		this.dividend = info.dividend ?? 0.005;
		this.conditionList = info.conditionList ?? [0, -0.06, -0.04, 0.04, 0.06];
	}

	update(curTime: number, curCondition: number): { code: number } {
		const myStock = new Condition(this);
		const ratio = myStock.getRandomRatio();
		if (this.isUpdateTime(curTime)) {
			return { code: 0 };
		}
		const updRatio = ratio + this.conditionList[curCondition];
		const correctRatio = updRatio + this.getCorrect();
		this.value *= 1 + correctRatio;
		this.beforeHistoryRatio = correctRatio;
		this.addCorrectionHistory(this.value, updRatio);
		return { code: 1 };
	}
}
