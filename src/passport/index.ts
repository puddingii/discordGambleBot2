import passport from 'passport';
import localStrategy from './localStrategy';
import UserModel, { IUserInfo } from '../model/User';

export default () => {
	// 로그인 성공시 세션스토어에 저장
	passport.serializeUser((user, done) => {
		done(null, (user as IUserInfo).discordId);
	});

	// 페이지 방문할때마다 발동
	passport.deserializeUser(async (id, done) => {
		try {
			const userInfo = await UserModel.findByDiscordId(id as string);
			done(null, userInfo);
		} catch (e) {
			done(e);
		}
	});

	localStrategy();
};
