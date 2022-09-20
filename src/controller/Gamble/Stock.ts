import StockAbstract, { StockAbstractConstructor } from './StockAbstract';

interface CheckStockValidationParam {
	name: string;
	type: 'stock' | 'coin';
	value: number;
	comment: string;
	minRatio: number;
	maxRatio: number;
	correctionCnt: number;
	conditionList: number[];
	dividend: number;
}

interface StockConstructor extends StockAbstractConstructor {
	conditionList: number[];
	dividend: number;
}

export default class Stock extends StockAbstract {
	/** 주식 값 유효성 검사 */
	static checkStockValidation(param: CheckStockValidationParam): {
		code: number;
		message?: string;
	} {
		const MAX_RATIO = 0.2;
		if (param.conditionList.length !== 5) {
			return {
				code: 0,
				message: '조정 퍼센트 입력형식이 이상합니다. 다시 입력해주세요.',
			};
		}

		/** 비율이 일정 수준이 넘었는지 */
		const isOverMaxRatio = (ratio: number) => {
			return Math.abs(ratio) > MAX_RATIO;
		};

		if (
			isOverMaxRatio(param.minRatio) ||
			isOverMaxRatio(param.maxRatio) ||
			isOverMaxRatio(param.dividend) ||
			param.conditionList.some(isOverMaxRatio)
		) {
			return { code: 0, message: '모든 비율은 +-0.2퍼센트 초과로 지정할 수 없습니다.' };
		}

		return { code: 1 };
	}
	conditionList: StockConstructor['conditionList'];
	dividend: StockConstructor['dividend'];
	readonly MAX_RATIO = 0.2;

	constructor(info: StockConstructor) {
		super(info);
		this.dividend = info.dividend ?? 0.005;
		this.conditionList = info.conditionList ?? [0, -0.06, -0.04, 0.04, 0.06];
	}

	update(curTime: number, ratio: number, curCondition: number): { code: number } {
		if (this.isUpdateTime(curTime)) {
			return { code: 0 };
		}
		const updRatio = ratio + this.conditionList[curCondition];
		const correctRatio = updRatio + this.calcCorrect();
		this.value *= 1 + correctRatio;
		this.beforeHistoryRatio = correctRatio;
		this.addCorrectionHistory(this.value, updRatio);
		return { code: 1 };
	}
}
