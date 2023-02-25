import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';
import TYPES from '../interfaces/containerType';
import Formatter from '../util/formatter';
import Logger from '../util/logger';
import Util from '../util/util';
import UserModel, { IUserStatics } from '../model/User';
import StockModel, { IStockStatics } from '../model/Stock';
import WeaponModel, { IWeaponStatics } from '../model/Weapon';
import StatusModel, { IStatusModelStatics } from '../model/Status';
import { IUserService } from '../interfaces/services/userService';
import { IStockService } from '../interfaces/services/stockService';
import { IWeaponService } from '../interfaces/services/weaponService';
import { IStatusService } from '../interfaces/services/statusService';
import UserService from '../services/userService';
import StockService from '../services/stockService';
import WeaponService from '../services/weaponService';
import StatusService from '../services/statusService';

export const container = new Container();
export const { lazyInject } = getDecorators(container);

// Util
container.bind<Formatter>(TYPES.Formatter).to(Formatter);
container.bind<Logger>(TYPES.Logger).to(Logger);
container.bind<Util>(TYPES.Util).to(Util);

// Model
container.bind<IUserStatics>(TYPES.UserModel).toConstantValue(UserModel);
container.bind<IStockStatics>(TYPES.StockModel).toConstantValue(StockModel);
container.bind<IWeaponStatics>(TYPES.WeaponModel).toConstantValue(WeaponModel);
container.bind<IStatusModelStatics>(TYPES.StatusModel).toConstantValue(StatusModel);

// Service
container.bind<IUserService>(TYPES.UserService).to(UserService);
container.bind<IStockService>(TYPES.StockService).to(StockService);
container.bind<IWeaponService>(TYPES.WeaponService).to(WeaponService);
container.bind<IStatusService>(TYPES.StatusService).to(StatusService);

export default {};
