import { inject, injectable } from 'inversify';
import mongoose from 'mongoose';
import TYPES from '../../interfaces/containerType';
import { IUtil } from '../../interfaces/common/util';

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

	getErrorMessage(err: unknown, defaultMessage?: string) {
		let message = defaultMessage || 'Unrecognized Error';

		if (typeof err === 'string') {
			message = err;
		}

		if (err instanceof Error || err instanceof mongoose.Error) {
			message = err.message;
		}

		return message;
	}
}

export default Util;
