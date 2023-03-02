import { BaseInteraction } from 'discord.js';
import client from '../../app';
import { isEnrolledUser } from '../middlewares/bot';
import { container } from '../../settings/container';
import TYPES from '../../interfaces/containerType';
import { ILogger } from '../../common/util/logger';

export default {
	name: 'interactionCreate',
	async execute(interaction: BaseInteraction) {
		const logger = container.get<ILogger>(TYPES.Logger);
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

		const commandName =
			(interaction.customId
				? interaction.customId.split('-')[0]
				: interaction.commandName) ?? '';
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return;
		}
		const notCheckCommandList = ['유저등록', '어드민'];
		if (!notCheckCommandList.includes(commandName)) {
			const isExist = await isEnrolledUser(interaction);
			if (!isExist) {
				await interaction.reply('유저정보가 없습니다. 유저등록부터 해주세요');
				return;
			}
		}
		if (commandName !== '어드민' && client.user?.presence.status !== 'online') {
			await interaction.reply('봇 셋팅중... 잠시후에 시도해주세요');
			return;
		}

		try {
			let logMessage = '';
			if (interaction.isSelectMenu()) {
				await command.select(interaction, {
					selectedList: interaction.values,
					callFuncName: interaction.customId.split('-')[1],
				});
				logMessage = `[interactionCreate-selectMenu]${username} - ${commandName}${interaction.values}`;
			} else if (interaction.isModalSubmit()) {
				await command.modalSubmit(interaction, {
					callFuncName: interaction.customId.split('-')[1],
				});
				logMessage = `[interactionCreate-modalSubmit]${username} - ${commandName}[Modal]`;
			} else {
				await command.execute(interaction);
				logMessage = `[interactionCreate]${username} - ${commandName}`;
			}
			logger.info(logMessage, ['(D)Event', 'Bot']);
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(errorMessage, ['(D)Event', 'Bot']);
		}
	},
};
