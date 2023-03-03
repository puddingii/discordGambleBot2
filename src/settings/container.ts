import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import TYPES from '../interfaces/containerType';
import Formatter from '../common/util/formatter';
import Logger from '../common/util/logger';
import Util from '../common/util/util';
import UserModel, { IUserStatics } from '../common/model/User';
import StockModel, { IStockStatics } from '../common/model/Stock';
import WeaponModel, { IWeaponStatics } from '../common/model/Weapon';
import StatusModel, { IStatusModelStatics } from '../common/model/Status';
import { IUserService } from '../interfaces/common/services/userService';
import { IStockService } from '../interfaces/common/services/stockService';
import { IWeaponService } from '../interfaces/common/services/weaponService';
import { IStatusService } from '../interfaces/common/services/statusService';
import UserService from '../common/services/userService';
import StockService from '../common/services/stockService';
import WeaponService from '../common/services/weaponService';
import StatusService from '../common/services/statusService';
import { IStatusController } from '../interfaces/common/controller/status';
import StatusController from '../common/controller/statusController';
import { IWeaponController } from '../interfaces/common/controller/weapon';
import WeaponController from '../common/controller/weaponController';
import { IUserWeaponController } from '../interfaces/common/controller/userWeapon';
import UserWeaponController from '../common/controller/userWeaponController';
import { IUserController } from '../interfaces/common/controller/user';
import UserController from '../common/controller/userController';
import { IUserStockController } from '../interfaces/common/controller/userStock';
import UserStockController from '../common/controller/userStockController';
import StockController from '../common/controller/stockController';
import { IStockController } from '../interfaces/common/controller/stock';

export const container = new Container();
export const { lazyInject } = getDecorators(container);

// Util
container.bind<Formatter>(TYPES.Formatter).to(Formatter).inSingletonScope();
container.bind<Logger>(TYPES.Logger).to(Logger).inSingletonScope();
container.bind<Util>(TYPES.Util).to(Util).inSingletonScope();

// Model
container.bind<IUserStatics>(TYPES.UserModel).toConstantValue(UserModel);
container.bind<IStockStatics>(TYPES.StockModel).toConstantValue(StockModel);
container.bind<IWeaponStatics>(TYPES.WeaponModel).toConstantValue(WeaponModel);
container.bind<IStatusModelStatics>(TYPES.StatusModel).toConstantValue(StatusModel);

// Service
container.bind<IUserService>(TYPES.UserService).to(UserService).inSingletonScope();
container.bind<IStockService>(TYPES.StockService).to(StockService).inSingletonScope();
container.bind<IWeaponService>(TYPES.WeaponService).to(WeaponService).inSingletonScope();
container.bind<IStatusService>(TYPES.StatusService).to(StatusService).inSingletonScope();

// Controller
container
	.bind<IStatusController>(TYPES.StatusController)
	.to(StatusController)
	.inSingletonScope();
container
	.bind<IWeaponController>(TYPES.WeaponController)
	.to(WeaponController)
	.inSingletonScope();
container
	.bind<IUserWeaponController>(TYPES.UserWeaponController)
	.to(UserWeaponController)
	.inSingletonScope();
container
	.bind<IUserStockController>(TYPES.UserStockController)
	.to(UserStockController)
	.inSingletonScope();
container
	.bind<IUserController>(TYPES.UserController)
	.to(UserController)
	.inSingletonScope();
container
	.bind<IStockController>(TYPES.StockController)
	.to(StockController)
	.inSingletonScope();

export default {};
