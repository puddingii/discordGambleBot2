import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import logger from './config/logger';
import secretKey from './config/secretKey';

import loaders from './loaders/index';

const startServer = async () => {
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildPresences,
		],
	});

	const app = express();

	await loaders({ client, app });

	client.login(secretKey.botToken);
	app.listen(secretKey.expressPort, () =>
		logger.info(
			`Connected the express server[My Server: http://localhost:${secretKey.expressPort}]`,
		),
	);
};

startServer();
