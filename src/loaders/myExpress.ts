import { Express, urlencoded, json } from 'express';
import morgan, { StreamOptions } from 'morgan';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import dependency from '../config/dependencyInjection';
import userRouter from '../routes/userRouter';
import passportConfig from '../passport';

const {
	cradle: { logger, secretKey },
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
	app.use(urlencoded({ extended: false }));
	app.use(json());
	app.use(
		session({
			secret: secretKey.sessionKey,
			resave: false, // 세션 데이터가 바뀌기 전까진 저장소에 저장하지 않음.
			saveUninitialized: true, // 세션이 필요하기전까지는 세션을 구동시키지 않는다.
		}),
	);
	const allowList = [/localhost:3000/];
	app.use(cors({ origin: allowList }));

	passportConfig();
	app.use(passport.initialize());
	app.use(passport.session());

	app.use('/user', userRouter);
};
