import { Client } from 'discord.js';
import { container } from '../../settings/container';
import TYPES from '../../interfaces/containerType';
import { ILogger } from '../../common/util/logger';

export default {
	name: 'ready',
	once: true,
	execute(client: Client) {
		const logger = container.get<ILogger>(TYPES.Logger);
		logger.info(`Ready! Logged in as ${client.user?.tag}`, ['(D)Event', 'Bot']);
	},
};
