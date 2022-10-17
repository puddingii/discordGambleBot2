import StockAbstract from './StockAbstract';

interface CheckStockValidationParam {
	name: string;
	type: 'coin';
	value: number;
	comment: string;
	minRatio: number;
	maxRatio: number;
	correctionCnt: number;
}

export default class Coin extends StockAbstract {
	static checkStockValidation(param: CheckStockValidationParam): {
		code: number;
		message?: string;
	} {
		const MAX_RATIO = 0.2;

		const isOverMaxRatio = (ratio: number) => {
			return Math.abs(ratio) > MAX_RATIO;
		};

		if (isOverMaxRatio(param.minRatio) || isOverMaxRatio(param.maxRatio)) {
			return { code: 0, message: '모든 비율은 +-0.2퍼센트 초과로 지정할 수 없습니다.' };
		}

		return { code: 1 };
	}

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
