import express from 'express';
import passport from 'passport';
import { isLoggedIn, isNotLoggedIn } from '../middlewares/express';
import { TUserModelInfo } from '../model/User';
import { ILogger } from '../util/logger';
import { container } from '../settings/container';
import TYPES from '../interfaces/containerType';

const router = express.Router();
const logger = container.get<ILogger>(TYPES.Logger);

router.get('/is-login', (req, res) => {
	return res.status(200).json({
		isLoggedIn: req.isAuthenticated(),
		nickname: (req.user as TUserModelInfo)?.nickname,
	});
});
router.post('/', isNotLoggedIn, (req, res, next) => {
	passport.authenticate('local', (authError, userInfo, obj) => {
		const message = obj?.message ?? '';
		if (authError) {
			logger.error(authError, ['Controller']);
			return next(authError);
		}
		if (!userInfo) {
			logger.warn(message, ['Controller']);
			return res.status(403).send('/admin/login');
		}

		return req.login(userInfo, loginError => {
			if (loginError) {
				logger.error(loginError, ['Controller']);
				return next(loginError);
			}
			return res.status(200).json({ user: userInfo });
		});
	})(req, res, next);
});
router.delete('/', isLoggedIn, (req, res, next) => {
	req.logout(err => {
		if (err) {
			logger.error(err, ['Controller']);
			next(err);
		}
		req.session.destroy(err => {
			if (err) {
				logger.error(err, ['Controller']);
				next(err);
			}
			return res.status(200).json({ isSucceed: true });
		});
	});
});

export default router;
