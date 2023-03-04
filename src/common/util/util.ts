import { inject, injectable } from 'inversify';
import { ILogger } from './logger';
import { IFormatter } from './formatter';
import TYPES from '../../interfaces/containerType';

export interface IUtil {
	logger: ILogger;
	formatter: IFormatter;
}

@injectable()
class Util implements IUtil {
	formatter: IUtil['formatter'];
	logger: IUtil['logger'];

	constructor(
		@inject(TYPES.Logger) logger: IUtil['logger'],
		@inject(TYPES.Formatter) formatter: IUtil['formatter'],
	) {
		this.logger = logger;
		this.formatter = formatter;
	}
}

export default Util;
