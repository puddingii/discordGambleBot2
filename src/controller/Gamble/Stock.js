const StockAbstract = require('./StockAbstract');

module.exports = class Stock extends StockAbstract {
	/**
	 * 주식 값 유효성 검사 FIXME 타입 수정 필요
	 * @param {} param
	 */
	static checkStockValidation(param) {
		const MAX_RATIO = 0.2;
		if (param.conditionList.length !== 5) {
			return {
				code: 0,
				message: '조정 퍼센트 입력형식이 이상합니다. 다시 입력해주세요.',
			};
		}

		const isOverMaxRatio = ratio => {
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
	constructor(info) {
		super(info);
		this.dividend = info.dividend ?? 0.005;
		this.conditionList = info.conditionList ?? [0, -0.06, -0.04, 0.04, 0.06];
	}

	update(curTime, ratio, curCondition) {
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
};
