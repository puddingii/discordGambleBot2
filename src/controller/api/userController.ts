import { Request, Response } from 'express';
import passport from 'passport';

export const postLogin = (req: Request, res: Response) => {
	const { body } = req;
	// passport.authenticate('local', {
	// 	successRedirect: '/',
	// 	failureRedirect: '/admin/login',
	// });
	console.log(req.body);
	res.redirect('/admin/login');
};

export default {
	postLogin,
};
