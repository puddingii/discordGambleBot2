import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';

import loaders from './loaders/index';
import dependency from './config/dependencyInjection';

const {
	cradle: {
		logger,
		secretKey: { expressPort, botToken },
	},
} = dependency;

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

	client.login(botToken);
	app.listen(expressPort, () =>
		logger.info(
			`Connected the express server[My Server: http://localhost:${expressPort}]`,
		),
	);
};

startServer();
