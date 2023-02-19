import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import userController from '../../controller/bot/userController';
import globalController from '../../controller/bot/statusController';
import { setComma } from '../../config/util';
import { container } from '../../settings/container';
import TYPES from '../../interfaces/containerType';
import { ILogger } from '../../util/logger';

const logger = container.get<ILogger>(TYPES.Logger);

export default {
	data: new SlashCommandBuilder()
		.setName('보조금받기')
		.setDescription('아끼다 다른 사람한테 넘어간다ㅋㅋ'),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();

			const user = await userController.getUser({ discordId });

			const money = await globalController.giveGrantMoney(user);

			await interaction.reply({
				content: `${setComma(money, true)}원을 받았습니다.`,
			});
		} catch (err) {
			logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
