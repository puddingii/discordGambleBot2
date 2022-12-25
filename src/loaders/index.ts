import { Client } from 'discord.js';
import { Express } from 'express';
import dbLoader from './db';
import gameLoader from './game';
import botLoader from './bot';
import cronLoader from './cron';
import expressLoader from './myExpress';

export default async ({
	client,
	app,
}: {
	client: Client;
	app: Express;
}): Promise<void> => {
	const dbResult = await dbLoader();
	if (!dbResult.code) {
		return;
	}
	await gameLoader();
	await botLoader(client);
	cronLoader.loadCron();
	expressLoader(app);
};
