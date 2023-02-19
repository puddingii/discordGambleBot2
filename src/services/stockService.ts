import { inject, injectable } from 'inversify';
import TYPES from '../interfaces/containerType';
import { IUserService, TUserParam } from '../interfaces/services/userService';
import User from '../game/User/User';
import Stock from '../game/Stock/Stock';
import { IUser, TUserGiftInfo } from '../interfaces/game/user';
import { IStockService, TValidStockParam } from '../interfaces/services/stockService';
import { IStock2 } from '../interfaces/game/stock';

@injectable()
class StockService implements IStockService {
	stockModel: IUserService['stockModel'];
	userModel: IUserService['userModel'];

	constructor(
		@inject(TYPES.UserModel) userModel: IUserService['userModel'],
		@inject(TYPES.StockModel) stockModel: IUserService['stockModel'],
	) {
		this.userModel = userModel;
		this.stockModel = stockModel;
	}

	isValidStockParam(param: TValidStockParam): {
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

	async getStock(stockName: string) {
		const stockInfo = await this.stockModel.findOne({ name: stockName });
		if (!stockInfo) {
			throw Error('이름에 해당하는 주식이 없습니다');
		}
		const stock = new Stock({
			name: stockInfo.name,
			ratio: { min: stockInfo.minRatio, max: stockInfo.maxRatio },
			type: <'stock'>stockInfo.type,
			updateTime: stockInfo.updateTime,
			value: stockInfo.value,
			comment: stockInfo.comment,
			conditionList: stockInfo.conditionList,
			correctionCnt: stockInfo.correctionCnt,
			dividend: stockInfo.dividend,
		});

		return stock;
	}
}

export default StockService;
