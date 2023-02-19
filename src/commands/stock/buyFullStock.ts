import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import userController from '../../controller/bot/userController';
import { container } from '../../settings/container';
import TYPES from '../../interfaces/containerType';
import { ILogger } from '../../util/logger';

const logger = container.get<ILogger>(TYPES.Logger);

export default {
	data: new SlashCommandBuilder()
		.setName('주식풀매수')
		.setDescription('주식 or 코인 풀매수')
		.addStringOption(option =>
			option.setName('이름').setDescription('주식이름').setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const name = interaction.options.getString('이름') ?? '';

			await userController.buySellStock({
				discordId,
				stockName: name,
				cnt: 1,
				isFull: true,
			});

			await interaction.reply({ content: '풀매수완료!' });
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(errorMessage, ['Command']);
			await interaction.reply({ content: `${errorMessage}` });
		}
	},
};
