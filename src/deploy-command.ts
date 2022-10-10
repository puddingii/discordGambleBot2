import { REST } from '@discordjs/rest';
import { Routes } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import dependency from './config/dependencyInjection';

const {
	cradle: { logger, secretKey },
} = dependency;

dotenv.config({ path: path.resolve(__dirname, '../.env') });

(function () {
	if (!secretKey.botToken || !secretKey.clientId || !secretKey.guildId) {
		logger.error('Required Env variables is not defined.');
		return;
	}

	/** Commands defined */
	const commands: Array<string> = [];
	const commandFolder = fs.readdirSync(path.resolve(__dirname, './commands'));
	const commonCommandFiles = commandFolder.filter(file => file.endsWith('.js'));
	commonCommandFiles.forEach(async file => {
		const { default: command } = await import(`./commands/${file}`);
		if (command.data) {
			commands.push(command.data.toJSON());
		}
	});

	/** Service Folder Init */
	const detailFolders = commandFolder.filter(file => !file.includes('.'));
	detailFolders.forEach(folder => {
		const detailFiles = fs.readdirSync(path.resolve(__dirname, `./commands/${folder}`));
		const commandFiles = detailFiles.filter(file => file.endsWith('.js'));
		commandFiles.forEach(async file => {
			const { default: command } = await import(`./commands/${folder}/${file}`);
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
