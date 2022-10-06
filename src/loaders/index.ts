import { Client } from 'discord.js';
import dbLoader from './db';
import gameLoader from './game';
import botLoader from './bot';

export default async ({ client }: { client: Client }): Promise<void> => {
	const dbResult = await dbLoader();
	if (!dbResult.code) {
		return;
	}
	const game = await gameLoader();
	botLoader(client, game);
};
