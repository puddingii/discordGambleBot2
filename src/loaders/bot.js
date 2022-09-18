const { Collection } = require('discord.js');
const path = require('path');
const fs = require('fs');

/**
 * @param {import('discord.js').Client} client
 * @param {import('../controller/Game')} game
 */
module.exports = (client, game) => {
	/** commands때문에 index.d.ts수정. */
	client.commands = new Collection();

	const commandFolder = fs.readdirSync(path.resolve(__dirname, '../commands'));
	const commonCommandFiles = commandFolder.filter(file => file.endsWith('.js'));
	/** Common Folder Init */
	commonCommandFiles.forEach(file => {
		// eslint-disable-next-line global-require
		const command = require(`../commands/${file}`);
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
			const command = require(`../commands/${folder}/${file}`);
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
		const event = require(`../events/${file}`);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args, game));
		} else {
			client.on(event.name, (...args) => event.execute(...args, game));
		}
	});
};
