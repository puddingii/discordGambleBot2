import { Express } from 'express';
import userRouter from './userRouter';
import authRouter from './authRouter';
import stockRouter from './stockRouter';
import weaponRouter from './weaponRouter';

export default (app: Express) => {
	app.use('/api/user', userRouter);
	app.use('/api/auth', authRouter);
	app.use('/api/stock', stockRouter);
	app.use('/api/weapon', weaponRouter);
};
