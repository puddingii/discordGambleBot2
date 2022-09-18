import { createContainer, asValue } from 'awilix';
import logger from './logger';
import util from './util';
import secret from './secretKey';

const container = createContainer();

container.register({
	util: asValue(util),
	logger: asValue(logger),
	secretKey: asValue(secret),
});

export default container;
