const { InteractionType } = require('discord.js');
const {
	cradle: { logger },
} = require('../config/dependencyInjection');
const { isEnrolledUser } = require('../config/middleware');

module.exports = {
	name: 'interactionCreate',
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../controller/Game')} game
	 */
	async execute(interaction, game) {
		const {
			user: { username },
		} = interaction;
		if (
			!interaction.isCommand() &&
			!interaction.isSelectMenu() &&
			!interaction.isModalSubmit()
		) {
			return;
		}

		const commandName = interaction.customId
			? interaction.customId.split('-')[0]
			: interaction.commandName;
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return;
		}
		const notCheckCommandList = ['유저등록'];
		if (!notCheckCommandList.includes(commandName)) {
			const isExist = await isEnrolledUser(interaction);
			if (!isExist) {
				await interaction.reply('유저정보가 없습니다. 유저등록부터 해주세요');
				return;
			}
		}

		try {
			let logMessage = '';
			if (interaction.isSelectMenu()) {
				await command.select(interaction, game, {
					selectedList: interaction.values,
					callFuncName: interaction.customId.split('-')[1],
				});
				logMessage = `[interactionCreate-selectMenu]${username} - ${commandName}${interaction.values}`;
			} else if (interaction.isModalSubmit()) {
				await command.modalSubmit(interaction, game, {
					callFuncName: interaction.customId.split('-')[1],
				});
				logMessage = `[interactionCreate-modalSubmit]${username} - ${commandName}[Modal]`;
			} else {
				await command.execute(interaction, game);
				logMessage = `[interactionCreate]${username} - ${commandName}`;
			}
			logger.info(logMessage);
		} catch (error) {
			logger.error(error);
		}
	},
};
