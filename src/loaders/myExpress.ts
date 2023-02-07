import { Express, urlencoded, json } from 'express';
import morgan, { StreamOptions } from 'morgan';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs/promises';
import path from 'path';

// eslint-disable-next-line import/no-named-default
import { default as connectMongo } from 'connect-mongodb-session';
import userRouter from '../routes/userRouter';
import authRouter from '../routes/authRouter';
import stockRouter from '../routes/stockRouter';
import weaponRouter from '../routes/weaponRouter';
import passportConfig from '../passport';
import logger from '../config/logger';
import secretKey from '../config/secretKey';

export default async (app: Express) => {
	const stream: StreamOptions = {
		// Use the http severity
		write: message => logger.info(message),
	};
	app.use(
		morgan(':method :url :status :res[content-length] - :response-time ms', {
			stream,
		}),
	);
	const allowList = [/localhost:3000/];
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
			cookie: {
				maxAge: 60000 * 60 * 24 * 30,
			},
			store: new MongoStore({ uri: secretKey.mongoUrl, collection: 'sessions' }),
		}),
	);

	app.use(passport.initialize());
	app.use(passport.session());
	passportConfig();

	app.use('/api/user', userRouter);
	app.use('/api/auth', authRouter);
	app.use('/api/stock', stockRouter);
	app.use('/api/weapon', weaponRouter);

	const swaggerFile = await fs.readFile(
		path.resolve(__dirname, '../swagger/swagger-output.json'),
		{ encoding: 'utf8' },
	);
	app.use('/doc', swaggerUi.serve, swaggerUi.setup(JSON.parse(swaggerFile)));
};
