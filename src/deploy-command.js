const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const {
	cradle: { logger, secretKey },
} = require('./config/dependencyInjection');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

(function () {
	if (!secretKey.botToken || !secretKey.clientId || !secretKey.guildId) {
		logger.error('Required Env variables is not defined.');
		return;
	}

	/** Commands defined */
	const commands = [];
	const commandFolder = fs.readdirSync(path.resolve(__dirname, './commands'));
	const commonCommandFiles = commandFolder.filter(file => file.endsWith('.js'));
	commonCommandFiles.forEach(file => {
		// eslint-disable-next-line global-require
		const command = require(`./commands/${file}`);
		if (command.data) {
			commands.push(command.data.toJSON());
		}
	});

	/** Service Folder Init */
	const detailFolders = commandFolder.filter(file => !file.includes('.'));
	detailFolders.forEach(folder => {
		const detailFiles = fs.readdirSync(path.resolve(__dirname, `./commands/${folder}`));
		const commandFiles = detailFiles.filter(file => file.endsWith('.js'));
		commandFiles.forEach(file => {
			// eslint-disable-next-line global-require
			const command = require(`./commands/${folder}/${file}`);
			if (command.data) {
				commands.push(command.data.toJSON());
			}
		});
	});

	/** Apply commands */
	const rest = new REST({ version: '10' }).setToken(secretKey.botToken);
	rest
		.put(Routes.applicationGuildCommands(secretKey.clientId, secretKey.guildId), {
			body: commands,
		})
		.then(() => logger.info('Successfully registered application commands.'))
		.catch(err => logger.error(err));
	// if (secretKey.nodeEnv !== 'production') {
	// 	rest
	// 		.put(Routes.applicationGuildCommands(secretKey.clientId, secretKey.guildId), {
	// 			body: commands,
	// 		})
	// 		.then(() => logger.info('Successfully registered application commands.'))
	// 		.catch(err => logger.error(err));
	// }
	// else {
	// 	/** Global apply => After 1 hour. */
	// 	rest
	// 		.put(Routes.applicationCommands(secretKey.clientId), { body: commands })
	// 		.then(() => logger.info('Successfully registered global application commands.'))
	// 		.catch(err => logger.error(err));
	// }
})();
