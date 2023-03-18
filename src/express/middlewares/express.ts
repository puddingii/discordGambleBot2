import { NextFunction, Request, Response } from 'express';

export const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.status(403).send('로그인 먼저 해주세요');
	}
};

export const isNotLoggedIn = (req: Request, res: Response, next: NextFunction) => {
	if (!req.isAuthenticated()) {
		next();
	} else {
		req.session.destroy(err => {
			if (err) {
				next(err);
			}
			res.status(403).send('다시 로그인 해주세요');
		});
	}
};

export default { isLoggedIn, isNotLoggedIn };
