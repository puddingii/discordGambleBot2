import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import logger from '../../config/logger';
import stockController from '../../controller/bot/stockController';

export default {
	data: new SlashCommandBuilder()
		.setName('주식풀매도')
		.setDescription('주식 or 코인 풀매도')
		.addStringOption(option =>
			option.setName('이름').setDescription('주식이름').setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const name = interaction.options.getString('이름') ?? '';

			await stockController.buySellStock({
				discordId,
				stockName: name,
				cnt: -1,
				isFull: true,
			});

			await interaction.reply({ content: '풀매도완료!' });
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(errorMessage);
			await interaction.reply({ content: `${errorMessage}` });
		}
	},
};
