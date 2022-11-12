import { Express } from 'express';
import morgan, { StreamOptions } from 'morgan';
import dependency from '../config/dependencyInjection';

const {
	cradle: { logger },
} = dependency;

export default (app: Express) => {
	const stream: StreamOptions = {
		// Use the http severity
		write: message => logger.info(message),
	};
	app.use(
		morgan(':method :url :status :res[content-length] - :response-time ms', {
			stream,
		}),
	);

	app.get('/hi', (req, res) => {
		res.send('fff');
	});
};
