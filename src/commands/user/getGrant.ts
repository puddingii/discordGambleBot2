import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import userController from '../../controller/bot/userController';
import globalController from '../../controller/bot/statusController';
import logger from '../../config/logger';
import { setComma } from '../../config/util';

export default {
	data: new SlashCommandBuilder()
		.setName('보조금받기')
		.setDescription('아끼다 다른 사람한테 넘어간다ㅋㅋ'),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();

			const user = userController.getUser({ discordId });

			const money = await globalController.giveGrantMoney(user);

			await interaction.reply({
				content: `${setComma(money, true)}원을 받았습니다.`,
			});
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
