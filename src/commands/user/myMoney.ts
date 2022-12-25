import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import logger from '../../config/logger';
import { setComma } from '../../config/util';
import userController from '../../controller/bot/userController';

export default {
	data: new SlashCommandBuilder().setName('내돈').setDescription('가지고 있는 돈'),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const user = userController.getUser({ discordId });

			await interaction.reply({
				content: `가지고 있는 돈: ${setComma(user.money, true)}원`,
			});
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
