const _ = require('lodash');

module.exports = class StockAbstract {
	#id;
	#ratio;

	/**
	 * @param {Object} stockInfo
	 * @param {{min: number, max: number}} stockInfo.ratio 최소최대 확률
	 * @param {string} stockInfo.name 이름
	 * @param {number} stockInfo.value 값
	 * @param {'stock' | 'coin'} stockInfo.type 타입
	 * @param {number} stockInfo.updateTime 업데이트주기
	 * @param {number} stockInfo.correctionCnt 조정주기
	 */
	constructor({ ratio, name, value, type, updateTime, correctionCnt, comment }) {
		this.#ratio = ratio;
		this.name = name;
		this.value = value;
		this.type = type;
		this.updateTime = updateTime;
		this.correctionCnt = correctionCnt ?? 4;
		this.correctionHistory = [];
		this.comment = comment;
		this.beforeHistoryRatio = 0;
	}

	/**
	 * 조정을 위한 히스토리 쌓기
	 * @param {Number} value
	 * @param {Number} ratio
	 */
	addCorrectionHistory(value, ratio) {
		this.correctionHistory.push({ value, ratio });
	}
	/** (조정주기 * 0.05) 이상의 변동률이 있을때 ((조정주기 - 1) * 0.05)만큼 -+해준다. */
	calcCorrect() {
		if (this.correctionHistory.length < this.correctionCnt) {
			return 0;
		}
		const corHistory = this.correctionHistory;
		const sumRatio = corHistory.reduce((acc, cur) => acc + cur.ratio, 0);
		const signal = sumRatio > 0 ? -1 : 1;

		const ratio =
			Math.abs(sumRatio) > 0.05 * this.correctionCnt
				? 0.05 * (this.correctionCnt - 1) * signal
				: 0;
		this.removeAllCorrectionHistory();
		return ratio;
	}
	/** @abstract */
	checkStockValidation() {}
	/** ratio에서 참고하여 min <= x <= max 범위의 랜덤 x값을 산출한다. */
	getRandomRatio() {
		const curRatio = this.getRatio();
		const volatility = curRatio.max - curRatio.min;

		const updPercent = _.round(volatility * Math.random(), 2) + curRatio.min;
		return updPercent;
	}
	/** ratio의 min, max 가져오기 */
	getRatio() {
		return this.#ratio;
	}
	/** 업데이트 할 시간인지 */
	isUpdateTime(curTime) {
		return curTime % this.updateTime !== 0;
	}
	/** 조정히스토리 지우기 */
	removeAllCorrectionHistory() {
		this.correctionHistory = [];
	}
	/**
	 * 나중에 관리자가 확률 조정할 때 쓰일 예정
	 * @param {{ min: number, max: number }} ratio
	 */
	setRatio(ratio) {
		this.#ratio = ratio;
	}
};
