import passport from 'passport';
import localStrategy from './localStrategy';
import dependency from '../config/dependencyInjection';
import { IUserInfo } from '../model/User';

const {
	cradle: { UserModel },
} = dependency;

export default () => {
	// 로그인 성공시 로직
	passport.serializeUser((user, done) => {
		done(null, (user as IUserInfo).discordId);
	});
	// 로그인
	passport.deserializeUser(async (id, done) => {
		await UserModel.findOne();
	});
	localStrategy();
};
