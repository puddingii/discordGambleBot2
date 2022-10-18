import { Client } from 'discord.js';
import dbLoader from './db';
import gameLoader from './game';
import botLoader from './bot';
import cronLoader from './cron';

export default async ({ client }: { client: Client }): Promise<void> => {
	const dbResult = await dbLoader();
	if (!dbResult.code) {
		return;
	}
	await gameLoader();
	await botLoader(client);
	cronLoader.loadCron();
};
