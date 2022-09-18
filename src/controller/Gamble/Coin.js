const StockAbstract = require('./StockAbstract');

module.exports = class Coin extends StockAbstract {
	/**
	 * 주식 값 유효성 검사 FIXME 타입 수정 필요
	 * @param {} param
	 */
	static checkStockValidation(param) {
		const MAX_RATIO = 0.2;

		const isOverMaxRatio = ratio => {
			return Math.abs(ratio) > MAX_RATIO;
		};

		if (isOverMaxRatio(param.minRatio) || isOverMaxRatio(param.maxRatio)) {
			return { code: 0, message: '모든 비율은 +-0.2퍼센트 초과로 지정할 수 없습니다.' };
		}

		return { code: 1 };
	}
	update(curTime, ratio) {
		if (this.isUpdateTime(curTime)) {
			return { code: 0 };
		}

		this.beforeHistoryRatio = ratio;
		this.value *= 1 + ratio;
		return { code: 1 };
	}
};
