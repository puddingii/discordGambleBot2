import mongoose from 'mongoose';
import secretKey from '../config/secretKey';
import { container } from '../settings/container';
import TYPES from '../interfaces/containerType';
import { ILogger } from '../interfaces/common/util/logger';

export default async (): Promise<{ code: number; message?: string }> => {
	const logger = container.get<ILogger>(TYPES.Logger);
	try {
		mongoose.set('strictQuery', true);
		await mongoose.connect(secretKey.mongoUrl);
		logger.info('Connected to MongoDB', ['Loader']);
		return { code: 1 };
	} catch (err) {
		let errorMessage = 'DB Init Error';
		if (err instanceof Error) {
			errorMessage = err.message;
		}
		if (typeof err === 'string') {
			errorMessage = err;
		}
		logger.error(errorMessage, ['Loader']);
		return { code: 0, message: errorMessage };
	}
};
