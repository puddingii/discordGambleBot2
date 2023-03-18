import passport from 'passport';
import passportLocal from 'passport-local';
import UserModel from '../../common/model/User';

export default () => {
	const LocalStrategy = passportLocal.Strategy;
	passport.use(
		new LocalStrategy(
			{ usernameField: 'nickname', passwordField: 'password' },
			async function (nickname, password, done) {
				try {
					const userInfo = await UserModel.findByUserInfo({ nickname });
					if (!userInfo) {
						return done(null, false, { message: '유저정보가 없습니다.' });
					}

					const isValid = await UserModel.checkPassword({ nickname }, password);
					if (!isValid) {
						return done(null, false, { message: '올바른 비밀번호가 아닙니다.' });
					}

					done(null, userInfo);
				} catch (err) {
					let errorMessage = '에러발생';
					if (err instanceof Error) {
						errorMessage = err.message;
					} else if (typeof err === 'string') {
						errorMessage = err;
					}
					done(null, false, { message: errorMessage });
				}
			},
		),
	);
};
