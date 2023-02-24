import { IStockStatics } from '../../model/Stock';
import { IUserStatics } from '../../model/User';
import { IStock2 } from '../game/stock';
import { IUser, TUserGiftInfo } from '../game/user';

export type TStockType = 'coin' | 'stock';

export type TValidStockParam = {
	name: string;
	type: 'stock';
	value: number;
	comment: string;
	minRatio: number;
	maxRatio: number;
	correctionCnt: number;
	conditionList: number[];
	dividend: number;
};

export interface IStockService {
	userModel: IUserStatics;
	stockModel: IStockStatics;
	/** 모든 주식 가져오기 */
	getAllStock(type?: TStockType): Promise<Array<IStock2>>;
	/** 주식 가져오기 */
	getStock(stockName: string): Promise<IStock2>;
	/** 주식 값 유효성 검사 */
	isValidStockParam(param: TValidStockParam): {
		code: number;
		message?: string;
	};
}

export default {};
