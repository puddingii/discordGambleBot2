import { Client, GatewayIntentBits } from 'discord.js';

import loaders from './loaders/index';
import key from './config/secretKey';

const { botToken } = key;

const startServer = async () => {
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildPresences,
		],
	});

	await loaders({ client });

	client.login(botToken);
};
// test

startServer();
