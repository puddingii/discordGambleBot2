import { createContainer, asValue } from 'awilix';
import logger from './logger';
import util from './util';
import secret from './secretKey';
import User from '../model/User';
import Stock from '../model/Stock';
import Status from '../model/Status';

const container = createContainer();

container.register({
	util: asValue(util),
	logger: asValue(logger),
	secretKey: asValue(secret),
	UserModel: asValue(User),
	StockModel: asValue(Stock),
	StatusModel: asValue(Status),
});

export default container;
