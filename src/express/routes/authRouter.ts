import express from 'express';
import passport from 'passport';
import { isLoggedIn, isNotLoggedIn } from '../middlewares/express';
import { container } from '../../settings/container';
import TYPES from '../../interfaces/containerType';
import { TUserModelResult } from '../../interfaces/model/user';
import { ILogger } from '../../interfaces/common/util/logger';

const router = express.Router();
const logger = container.get<ILogger>(TYPES.Logger);

router.get('/is-login', (req, res) => {
	/*
	#swagger.tags = ['User']
	#swagger.description = '로그인 상태인지 확인'
	*/
	return res.status(200).json({
		isLoggedIn: req.isAuthenticated(),
		nickname: (req.user as TUserModelResult)?.nickname,
	});
});
router.post('/', isNotLoggedIn, (req, res, next) => {
	/*
	#swagger.tags = ['User']
	#swagger.description = '로그인 시도'
	#swagger.parameters['userInfo'] = {
		in: 'body',
		description: '유저정보(테스트 서버)',
		schema: {
			$nickname: '건빵',
			$password: 'c9hfwulivso1',
		}
	}
	*/
	passport.authenticate(
		'local',
		(
			authError: unknown,
			userInfo: false | TUserModelResult,
			obj: { message: string } | undefined,
		) => {
			const message = obj?.message ?? '';
			if (authError) {
				logger.error(authError, ['Controller']);
				return next(authError);
			}
			if (!userInfo) {
				logger.warn(message, ['Controller']);
				return res.status(403).send(message);
			}

			return req.login(userInfo, loginError => {
				if (loginError) {
					logger.error(loginError, ['Controller']);
					return next(loginError);
				}
				return res.status(200).json({ user: userInfo });
			});
		},
	)(req, res, next);
});
router.delete('/', isLoggedIn, (req, res, next) => {
	/*
	#swagger.tags = ['User']
	#swagger.description = '로그아웃 시도'
	*/
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
