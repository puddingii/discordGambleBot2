export type TRatioType = { min: number; max: number };
export type TStockData = {
	ratio: TRatioType;
	name: string;
	value: number;
	type: 'stock' | 'coin';
	updateTime: number;
	correctionCnt: number;
	comment: string;
	beforeHistoryRatio: number;
};
export interface IStockAbstract<T extends TStockData['type']>
	extends Omit<TStockData, 'ratio'> {
	type: T;
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
	TStockData,
	'correctionCnt' | 'comment' | 'beforeHistoryRatio'
> &
	Pick<Partial<TStockData>, 'correctionCnt' | 'comment' | 'beforeHistoryRatio'>;

type TAddedStock2 = {
	conditionList: [number, number, number, number, number];
	dividend: number;
	type: 'stock';
};
type TAddedCoin = {
	type: 'coin';
};
export type TStockInfo = Omit<TStockData, 'type'> & TAddedStock2;
export type TCoinInfo = Omit<TStockData, 'type'> & TAddedCoin;

export interface IStock extends IStockAbstract<'stock'>, TAddedStock2 {
	update(curTime: number, curCondition: number): { code: number };
}
export interface ICoin extends IStockAbstract<'coin'> {
	update(curTime: number): { code: number };
}
export type TStockConstructor = TStockAbstractConstructor & Partial<TAddedStock2>;

export type TStockClassType = IStock | ICoin;
