import { Collection, Client } from 'discord.js';
import path from 'path';
import fs from 'fs';
import Game from '../controller/Game';

export default (client: Client, game: Game) => {
	/** commands때문에 index.d.ts수정. */
	client.commands = new Collection();

	const commandFolder = fs.readdirSync(path.resolve(__dirname, '../commands'));
	const commonCommandFiles = commandFolder.filter(file => file.endsWith('.js'));
	/** Common Folder Init */
	commonCommandFiles.forEach(file => {
		// eslint-disable-next-line global-require
		const command = require(`../commands/${file}`); // FIXME
		if (command.data) {
			client.commands.set(command.data.name, command);
		}
	});

	/** Service Folder Init */
	const detailFolders = commandFolder.filter(file => !file.includes('.'));
	detailFolders.forEach(folder => {
		const detailFiles = fs.readdirSync(path.resolve(__dirname, `../commands/${folder}`));
		const commandFiles = detailFiles.filter(file => file.endsWith('.js'));
		commandFiles.forEach(file => {
			// eslint-disable-next-line global-require
			const command = require(`../commands/${folder}/${file}`); // FIXME
			if (command.data) {
				client.commands.set(command.data.name, command);
			}
		});
	});

	const eventFiles = fs
		.readdirSync(path.resolve(__dirname, '../events'))
		.filter(file => file.endsWith('.js'));
	eventFiles.forEach(file => {
		// eslint-disable-next-line global-require
		const event = require(`../events/${file}`); // FIXME
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args, game));
		} else {
			client.on(event.name, (...args) => event.execute(...args, game));
		}
	});
};
