import { Express } from 'express';
import userRouter from './userRouter';
import userWeaponRouter from './userWeaponRouter';
import authRouter from './authRouter';
import stockRouter from './stockRouter';
import weaponRouter from './weaponRouter';

export default (app: Express) => {
	app.use('/user', userRouter);
	app.use('/user/weapon', userWeaponRouter);
	app.use('/auth', authRouter);
	app.use('/stock', stockRouter);
	app.use('/weapon', weaponRouter);
};
