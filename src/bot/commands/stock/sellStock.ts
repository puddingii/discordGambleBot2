import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { IUserStockController } from '../../../interfaces/common/controller/userStock';
import { ILogger } from '../../../interfaces/common/util/logger';

const logger = container.get<ILogger>(TYPES.Logger);
const userStockController = container.get<IUserStockController>(
	TYPES.UserStockController,
);

export default {
	data: new SlashCommandBuilder()
		.setName('주식매도')
		.setDescription('주식 or 코인 사기')
		.addStringOption(option =>
			option.setName('이름').setDescription('주식이름').setRequired(true),
		)
		.addNumberOption(option =>
			option.setName('수량').setDescription('몇개나 팔건지').setRequired(true),
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

			await userStockController.tradeStock({
				discordId,
				stockName: name,
				cnt: cnt * -1,
				isFull: false,
			});

			await interaction.reply({ content: '매도완료!' });
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
