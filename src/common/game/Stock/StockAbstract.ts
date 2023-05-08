import _ from 'lodash';
import {
	IStockAbstract,
	TStockAbstractConstructor,
	TStockData,
} from '../../../interfaces/game/stock';

export default abstract class StockAbstract<T extends TStockData['type']>
	implements IStockAbstract<T>
{
	private _ratio: TStockData['ratio'];
	beforeHistoryRatio: TStockData['beforeHistoryRatio'];
	comment: TStockData['comment'];
	correctionCnt: TStockData['correctionCnt'];
	correctionHistory: { value: number; ratio: number }[];
	name: TStockData['name'];
	type: T;
	updateTime: TStockData['updateTime'];
	value: TStockData['value'];

	constructor({
		ratio,
		name,
		value,
		type,
		updateTime,
		correctionCnt,
		comment,
		beforeHistoryRatio,
	}: TStockAbstractConstructor) {
		this._ratio = ratio;
		this.name = name;
		this.value = value;
		this.type = <T>type;
		this.updateTime = updateTime;
		this.correctionCnt = correctionCnt ?? 4;
		this.comment = comment ?? '';
		this.correctionHistory = [];
		this.beforeHistoryRatio = beforeHistoryRatio ?? 0;
	}

	addCorrectionHistory(value: number, ratio: number) {
		this.correctionHistory.push({ value, ratio });
	}

	getCorrect(): number {
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

	getRandomRatio() {
		const curRatio = this._ratio;
		const volatility = curRatio.max - curRatio.min;

		const updPercent = _.round(volatility * Math.random(), 2) + curRatio.min;
		return updPercent;
	}

	getRatio() {
		return this._ratio;
	}

	isUpdateTime(curTime: number) {
		return curTime % this.updateTime !== 0;
	}

	removeAllCorrectionHistory() {
		this.correctionHistory = [];
	}

	setRatio(ratio: TStockData['ratio']) {
		// if (Math.abs(ratio.min) > 0.02 || Math.abs(ratio.max) > 0.02) {
		// 	throw new Error('Set Ratio Error. Minimum/Maximum size is too big.');
		// }
		this._ratio = ratio;
	}
}
