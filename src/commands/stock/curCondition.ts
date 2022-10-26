import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import dependency from '../../config/dependencyInjection';
import stockController from '../../controller/bot/stockController';
import userController from '../../controller/bot/userController';

const {
	cradle: { logger },
} = dependency;

export default {
	data: new SlashCommandBuilder()
		.setName('주식흐름')
		.setDescription(
			'주식 흐름임. 주식 종류에 따라 이 영향을 많이 받을수도 아닐수도 있음. [비용: 1만원]',
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const condition = stockController.getCurrentCondition();
			let conditionText = '';
			switch (condition) {
				case 1:
					conditionText = '씹악재';
					break;
				case 2:
					conditionText = '악재';
					break;
				case 3:
					conditionText = '호재';
					break;
				case 4:
					conditionText = '씹호재';
					break;
				default:
					conditionText = '아무일도 없음';
			}

			await userController.updateMoney(discordId, -10000);

			await interaction.reply({ content: conditionText, ephemeral: true });
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(errorMessage);
			await interaction.reply({ content: `${errorMessage}`, ephemeral: true });
		}
	},
};
