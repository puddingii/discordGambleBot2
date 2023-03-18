import { Express, urlencoded, json } from 'express';
import morgan, { StreamOptions } from 'morgan';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import fs from 'fs/promises';
import path from 'path';

// eslint-disable-next-line import/no-named-default
import { default as connectMongo } from 'connect-mongodb-session';
import setRouter from '../express/routes';
import passportConfig from '../express/passport';
import secretKey from '../config/secretKey';
import { container } from '../settings/container';
import TYPES from '../interfaces/containerType';
import { ILogger } from '../common/util/logger';

export default async (app: Express) => {
	const logger = container.get<ILogger>(TYPES.Logger);
	const stream: StreamOptions = {
		// Use the http severity
		write: message => logger.info(message, ['Express']),
	};
	app.use(
		morgan(':method :url :status :res[content-length] - :response-time ms', {
			stream,
		}),
	);
	const allowList = [/localhost/];
	app.use(cors({ origin: allowList, credentials: true }));
	app.use(cookieParser(secretKey.sessionKey));
	app.use(urlencoded({ extended: false }));
	app.use(json());
	const MongoStore = connectMongo(session);
	app.use(
		session({
			secret: secretKey.sessionKey,
			resave: false, // 세션 데이터가 바뀌기 전까진 저장소에 저장하지 않음.
			saveUninitialized: true, // 세션이 필요하기전까지는 세션을 구동시키지 않는다.
			proxy: true,
			cookie: {
				maxAge: 60000 * 60 * 24 * 30, // 30일 기준
				sameSite: secretKey.nodeEnv === 'production' ? 'none' : undefined,
				httpOnly: true,
				secure: secretKey.nodeEnv === 'production',
			},
			store: new MongoStore({ uri: secretKey.mongoUrl, collection: 'sessions' }),
		}),
	);

	app.use(passport.initialize());
	app.use(passport.session());
	passportConfig();

	setRouter(app);

	if (secretKey.nodeEnv === 'development') {
		const swaggerUi = await import('swagger-ui-express');
		const swaggerFile = await fs.readFile(
			path.resolve(__dirname, '../express/swagger/swagger-api.json'),
			{ encoding: 'utf8' },
		);
		app.use('/doc', swaggerUi.serve, swaggerUi.setup(JSON.parse(swaggerFile)));
	}
};
