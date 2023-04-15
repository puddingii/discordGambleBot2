import { inject, injectable } from 'inversify';
import TYPES from '../../interfaces/containerType';
import { IFormatter } from '../../interfaces/common/util/formatter';
import { ILogger } from '../../interfaces/common/util/logger';

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
