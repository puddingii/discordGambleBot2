import { Client } from 'discord.js';
import logger from '../config/logger';

export default {
	name: 'ready',
	once: true,
	execute(client: Client) {
		logger.info(`Ready! Logged in as ${client.user?.tag}`);
	},
};
