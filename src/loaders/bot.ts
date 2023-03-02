import { Collection, Client } from 'discord.js';
import path from 'path';
import fs from 'fs';

export default async (client: Client) => {
	/** commands때문에 index.d.ts수정. */
	client.commands = new Collection();

	const commandFolder = fs.readdirSync(path.resolve(__dirname, '../bot/commands'));
	const commonCommandFiles = commandFolder.filter(
		file => file.endsWith('.js') || file.endsWith('.ts'),
	);
	/** Common Folder Init */
	for await (const file of commonCommandFiles) {
		const { default: command } = await import(`../bot/commands/${file}`);
		if (command.data) {
			client.commands.set(command.data.name, command);
		}
	}

	/** Service Folder Init */
	const detailFolders = commandFolder.filter(file => !file.includes('.'));
	for await (const folder of detailFolders) {
		const detailFiles = fs.readdirSync(
			path.resolve(__dirname, `../bot/commands/${folder}`),
		);
		const commandFiles = detailFiles.filter(
			file => file.endsWith('.js') || file.endsWith('.ts'),
		);

		for await (const file of commandFiles) {
			const { default: command } = await import(`../bot/commands/${folder}/${file}`);
			if (command.data) {
				client.commands.set(command.data.name, command);
			}
		}
	}

	const eventFiles = fs
		.readdirSync(path.resolve(__dirname, '../bot/events'))
		.filter(file => file.endsWith('.js') || file.endsWith('.ts'));
	eventFiles.forEach(async file => {
		const { default: event } = await import(`../bot/events/${file}`);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	});
};
