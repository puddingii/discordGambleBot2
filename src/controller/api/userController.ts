import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import dependency from '../../config/dependencyInjection';

const {
	cradle: { logger },
} = dependency;

export const postLogin = (req: Request, res: Response, next: NextFunction) => {
	const { body, query } = req;
	passport.authenticate('local', (authError, userInfo, { message }) => {
		if (authError) {
			logger.error(authError);
			return next(authError);
		}
		if (!userInfo) {
			logger.warn(message);
			return res.redirect('/admin/login');
		}

		return req.login(userInfo, loginError => {
			if (loginError) {
				logger.error(loginError);
				return next(loginError);
			}
			return res.redirect('/');
		});
	})(req, res, next);
};

export default {
	postLogin,
};
