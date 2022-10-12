import _ from 'lodash';

interface StockAbstractInfo {
	ratio: { min: number; max: number };
	name: string;
	value: number;
	type: 'stock' | 'coin';
	updateTime: number;
	correctionCnt: number;
	comment: string;
}

export type StockAbstractConstructor = Omit<
	StockAbstractInfo,
	'correctionCnt' | 'comment'
> &
	Pick<Partial<StockAbstractInfo>, 'correctionCnt' | 'comment'>;

export default abstract class StockAbstract {
	private _ratio: StockAbstractInfo['ratio'];
	beforeHistoryRatio: number;
	comment: StockAbstractInfo['comment'];
	correctionCnt: StockAbstractInfo['correctionCnt'];
	correctionHistory: { value: number; ratio: number }[];
	name: StockAbstractInfo['name'];
	type: StockAbstractInfo['type'];
	updateTime: StockAbstractInfo['updateTime'];
	value: StockAbstractInfo['value'];

	constructor({
		ratio,
		name,
		value,
		type,
		updateTime,
		correctionCnt,
		comment,
	}: StockAbstractConstructor) {
		this._ratio = ratio;
		this.name = name;
		this.value = value;
		this.type = type;
		this.updateTime = updateTime;
		this.correctionCnt = correctionCnt ?? 4;
		this.comment = comment ?? '';
		this.correctionHistory = [];
		this.beforeHistoryRatio = 0;
	}

	/** 조정을 위한 히스토리 쌓기	*/
	addCorrectionHistory(value: number, ratio: number) {
		this.correctionHistory.push({ value, ratio });
	}

	/** (조정주기 * 0.05) 이상의 변동률이 있을때 ((조정주기 - 1) * 0.05)만큼 -+해준다. */
	calcCorrect(): number {
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

	/** ratio에서 참고하여 min <= x <= max 범위의 랜덤 x값을 산출한다. */
	getRandomRatio() {
		const curRatio = this._ratio;
		const volatility = curRatio.max - curRatio.min;

		const updPercent = _.round(volatility * Math.random(), 2) + curRatio.min;
		return updPercent;
	}

	/** ratio의 min, max 가져오기 */
	getRatio() {
		return this._ratio;
	}

	/** 업데이트 할 시간인지 */
	isUpdateTime(curTime: number) {
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
	setRatio(ratio: StockAbstractConstructor['ratio']) {
		// if (Math.abs(ratio.min) > 0.02 || Math.abs(ratio.max) > 0.02) {
		// 	throw new Error('Set Ratio Error. Minimum/Maximum size is too big.');
		// }
		this._ratio = ratio;
	}
}
