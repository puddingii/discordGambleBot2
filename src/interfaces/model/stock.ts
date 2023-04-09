import { Model, Types } from 'mongoose';
import { TPopulatedUserStockInfo } from '../game/user';

interface DoucmentResult<T> {
	_doc: T;
}

export interface IStockModel extends Document, DoucmentResult<IStockModel> {
	/** 이름 */
	name: string;
	/** 타입 (코인 or 주식) */
	type: string;
	/** 1개당 가격 */
	value: number;
	/** 설명 */
	comment: string;
	/** 변동률 최소치 */
	minRatio: number;
	/** 변동률 최대치 */
	maxRatio: number;
	/** 업데이트 주기. 모든 코인, 주식 동일하게 2시간마다 */
	updateTime: number;
	/** 조정주기 업데이트주기*cnt 시간(ex 업데이트 주기 2시간*4 = 8시간마다 조정) */
	correctionCnt: number;
	/** 주식 히스토리 */
	updHistory: Types.Array<{ value: number; date: string }>;
	/** 환경에 영향을 받는정도 순서대로 [아무일없음,씹악재, 악재, 호재, 씹호재] */
	conditionList: Types.Array<number>;
	/** 배당 주식에만 해당함 */
	dividend: number;
}

export type IStockModelResult = IStockModel & {
	_id: Types.ObjectId;
};

export type TAggregatedStockInfo = Omit<IStockModelResult, 'updHistory'> & {
	beforeHistoryRatio: number;
};

export interface IStockStatics extends Model<IStockModel> {
	/** Type에 맞는 주식정보 다 가져오기 */
	findAllList(type: 'stock' | 'coin' | 'all'): Promise<TAggregatedStockInfo[]>;

	/** 주식이름으로 주식정보 찾아오기 */
	findByName(name: string): Promise<TAggregatedStockInfo | null>;

	/** 주식추가 */
	addStock(
		stockInfo: TPopulatedUserStockInfo['stock'],
	): Promise<{ code: number; message?: string }>;

	/** 주식제거 */
	deleteStock(name: string): Promise<{ cnt: number }>;

	/** 업데이트 히스토리 가져오기 */
	getUpdateHistory(name: string, limitedCnt: number): Promise<IStockModel['updHistory']>;

	/** 주식 List 업데이트(주식 히스토리 누적) */
	updateStockList(updateList: TPopulatedUserStockInfo['stock'][]): Promise<void>;

	/** 주식 단일 업데이트(주식 히스토리 미누적) */
	updateStock(updatedStockInfo: TPopulatedUserStockInfo['stock']): Promise<void>;
}
