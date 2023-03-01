import passport from 'passport';
import localStrategy from './localStrategy';
import UserModel, { TUserModelInfo } from '../model/User';

export default () => {
	// 로그인 성공시 세션스토어에 저장
	passport.serializeUser((user, done) => {
		done(null, (user as TUserModelInfo).discordId);
	});

	// 페이지 방문할때마다 발동
	passport.deserializeUser(async (id, done) => {
		try {
			const userInfo = await UserModel.findByUserInfo({ discordId: id as string });
			done(null, userInfo);
		} catch (e) {
			done(e);
		}
	});

	localStrategy();
};
