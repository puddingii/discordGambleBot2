import 'reflect-metadata';
import { Client, GatewayIntentBits } from 'discord.js';
import express from 'express';
import secretKey from './config/secretKey';
import { container } from './settings/container';
import TYPES from './interfaces/containerType';
import { ILogger } from './util/logger';
import loaders from './loaders/index';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildPresences,
	],
	presence: { status: 'dnd' },
});

const startServer = async () => {
	const app = express();

	await loaders({ client, app });
	const logger = container.get<ILogger>(TYPES.Logger);

	client.login(secretKey.botToken);
	app.listen(secretKey.expressPort, () =>
		logger.info(
			`Connected the express server: http://localhost:${secretKey.expressPort}`,
			['Main'],
		),
	);
};

startServer();

export default client;
