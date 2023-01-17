import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import logger from '../../config/logger';
import { IUserInfo } from '../../model/User';

export const getLoginInfo = (req: Request, res: Response) => {
	return res.status(200).json({
		isLoggedIn: req.isAuthenticated(),
		nickname: (req.user as IUserInfo)?.nickname,
	});
};

export const postLogin = (req: Request, res: Response, next: NextFunction) => {
	passport.authenticate('local', (authError, userInfo, obj) => {
		const message = obj?.message ?? '';
		if (authError) {
			logger.error(authError);
			return next(authError);
		}
		if (!userInfo) {
			logger.warn(message);
			return res.status(403).send('/admin/login');
		}

		return req.login(userInfo, loginError => {
			if (loginError) {
				logger.error(loginError);
				return next(loginError);
			}
			return res.status(200).json({ user: userInfo });
		});
	})(req, res, next);
};

export const postLogout = (req: Request, res: Response, next: NextFunction) => {
	req.logout(err => {
		if (err) {
			logger.error(err);
			next(err);
		}
		req.session.destroy(err => {
			if (err) {
				logger.error(err);
				next(err);
			}
			return res.status(200).json({ isSucceed: true });
		});
	});
};

export default {
	postLogin,
	postLogout,
	getLoginInfo,
};
