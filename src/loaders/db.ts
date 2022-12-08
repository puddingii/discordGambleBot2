import mongoose from 'mongoose';
import dependencyInjection from '../config/dependencyInjection';

const {
	cradle: { secretKey, logger },
} = dependencyInjection;

export default async (): Promise<{ code: number; message?: string }> => {
	try {
		await mongoose.connect(secretKey.mongoUrl);
		logger.info('[DB] Connected to MongoDB');
		return { code: 1 };
	} catch (err) {
		let errorMessage = 'DB Init Error';
		if (err instanceof Error) {
			errorMessage = err.message;
		}
		if (typeof err === 'string') {
			errorMessage = err;
		}
		logger.error(errorMessage);
		return { code: 0, message: errorMessage };
	}
};
