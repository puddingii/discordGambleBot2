import dotenv from 'dotenv';
import path from 'path';

const envPath =
	process.env.NODE_ENV === 'development' ? '../../.env.local' : '../../.env';
dotenv.config({ path: path.resolve(__dirname, envPath) });

const mongoUrl =
	(process.env.NODE_ENV ?? '') === 'development'
		? `mongodb+srv://${process.env.MONGO_ID ?? ''}:${
				process.env.MONGO_PW ?? ''
		  }@gamblebottest.krflbk1.mongodb.net/?retryWrites=true&w=majority`
		: `mongodb+srv://${process.env.MONGO_ID ?? ''}:${
				process.env.MONGO_PW ?? ''
		  }@discordgamebot.azjqlii.mongodb.net/?retryWrites=true&w=majority`;

export default {
	/** bot key */
	botToken: process.env.BOT_TOKEN ?? '',
	nodeEnv: process.env.NODE_ENV ?? '',
	mongoId: process.env.MONGO_ID ?? '',
	mongoPw: process.env.MONGO_PW ?? '',
	mongoUrl,
	clientId: process.env.CLIENT_ID ?? '',
	guildId: process.env.GUILD_ID ?? '',
	adminId: process.env.ADMIN_ID ?? '',
	adminPw: process.env.ADMIN_PW ?? '',
	stockUpdateTime: parseInt(process.env.STOCK_UPDATE_TIME ?? '4', 10),
	/** 초 단위 */
	gambleUpdateTime: parseInt(process.env.GAMBLE_UPDATE_TIME ?? '1800', 10),
	/** express key */
	expressPort: parseInt(process.env.EXPRESS_PORT ?? '', 10),
	sessionKey: process.env.SESSION_KEY ?? '',
	passwordHashRound: parseInt(process.env.PASSWORD_HASH_ROUND ?? '', 10),
	corsOriginList: process.env.CORS_LIST?.split(',').map(origin => new RegExp(origin)),
};
