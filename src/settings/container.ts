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
import { IUserService } from '../interfaces/services/userService';
import { IStockService } from '../interfaces/services/stockService';
import { IWeaponService } from '../interfaces/services/weaponService';
import { IStatusService } from '../interfaces/services/statusService';
import UserService from '../common/services/userService';
import StockService from '../common/services/stockService';
import WeaponService from '../common/services/weaponService';
import StatusService from '../common/services/statusService';

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

export default {};
