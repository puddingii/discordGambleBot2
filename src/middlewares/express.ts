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
		res.status(403).send('이미 로그인 상태입니다.');
	}
};

export default { isLoggedIn, isNotLoggedIn };
