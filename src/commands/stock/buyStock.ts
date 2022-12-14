import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import logger from '../../config/logger';
import stockController from '../../controller/bot/stockController';

export default {
	data: new SlashCommandBuilder()
		.setName('주식매수')
		.setDescription('주식 or 코인 사기')
		.addStringOption(option =>
			option.setName('이름').setDescription('주식이름').setRequired(true),
		)
		.addNumberOption(option =>
			option.setName('수량').setDescription('몇개나 살건지').setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const name = interaction.options.getString('이름') ?? '';
			const cnt = Math.floor(interaction.options.getNumber('수량') ?? 0);

			if (cnt < 1) {
				await interaction.reply({ content: '갯수를 입력해주세요' });
				return;
			}

			await stockController.buySellStock({
				discordId,
				stockName: name,
				cnt,
				isFull: false,
			});

			await interaction.reply({ content: '매수완료!' });
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
