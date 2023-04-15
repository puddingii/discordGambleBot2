import passport from 'passport';
import localStrategy from './localStrategy';
import { TUserModelResult } from '../../interfaces/model/user';

export default () => {
	// 로그인 성공시 세션스토어에 저장
	passport.serializeUser((user, done) => {
		done(null, (user as TUserModelResult).discordId);
	});

	// 페이지 방문할때마다 발동a
	passport.deserializeUser((id, done) => {
		try {
			done(null, id as string);
		} catch (e) {
			done(e);
		}
	});

	localStrategy();
};
