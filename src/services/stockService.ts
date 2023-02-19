import { inject, injectable } from 'inversify';
import { Types } from 'mongoose';
import TYPES from '../interfaces/containerType';
import { IUserService, TUserParam } from '../interfaces/services/userService';
import User from '../game/User/User';
import Stock from '../game/Stock/Stock';
import { IUser, TUserGiftInfo } from '../interfaces/game/user';

@injectable()
class StockService {
	stockModel: IUserService['stockModel'];
	userModel: IUserService['userModel'];

	constructor(
		@inject(TYPES.UserModel) userModel: IUserService['userModel'],
		@inject(TYPES.StockModel) stockModel: IUserService['stockModel'],
	) {
		this.userModel = userModel;
		this.stockModel = stockModel;
	}
}

export default StockService;
