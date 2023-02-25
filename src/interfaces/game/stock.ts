export type TRatioType = { min: number; max: number };
export type TStockInfo = {
	ratio: TRatioType;
	name: string;
	value: number;
	type: 'stock' | 'coin';
	updateTime: number;
	correctionCnt: number;
	comment: string;
	beforeHistoryRatio: number;
};
export interface IStockAbstract extends Omit<TStockInfo, 'ratio'> {
	/** 조정을 위한 히스토리 쌓기	*/
	addCorrectionHistory(value: number, ratio: number): void;
	/** (조정주기 * 0.05) 이상의 변동률이 있을때 ((조정주기 - 1) * 0.05)만큼 -+해준다. */
	getCorrect(): number;
	/** ratio에서 참고하여 min <= x <= max 범위의 랜덤 x값을 산출한다. */
	getRandomRatio(): number;
	/** ratio의 min, max 가져오기 */
	getRatio(): TRatioType;
	/** 업데이트 할 시간인지 */
	isUpdateTime(curTime: number): boolean;
	/** 조정히스토리 지우기 */
	removeAllCorrectionHistory(): void;
	/**
	 * 나중에 관리자가 확률 조정할 때 쓰일 예정
	 * @param {{ min: number, max: number }} ratio
	 */
	setRatio(ratio: TRatioType): void;
}

export type TStockAbstractConstructor = Omit<
	TStockInfo,
	'correctionCnt' | 'comment' | 'beforeHistoryRatio'
> &
	Pick<Partial<TStockInfo>, 'correctionCnt' | 'comment'>;

type TAddedStock2 = {
	conditionList: number[];
	dividend: number;
};
export type TStockInfo2 = TStockInfo & TAddedStock2;
export interface IStock2 extends IStockAbstract, TAddedStock2 {
	update(curTime: number, curCondition: number): { code: number };
}

export type TStockConstructor = TStockAbstractConstructor & Partial<TStockInfo2>;
