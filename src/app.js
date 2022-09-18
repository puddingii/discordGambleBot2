const { Client, GatewayIntentBits } = require('discord.js');
const loaders = require('./loaders/index');
const { botToken } = require('./config/secretKey');

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

startServer();
