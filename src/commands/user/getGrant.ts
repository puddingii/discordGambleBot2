import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import dependency from '../../config/dependencyInjection';
import userController from '../../controller/bot/userController';
import globalController from '../../controller/bot/globalController';

const {
	cradle: {
		logger,
		util: { setComma },
	},
} = dependency;

export default {
	data: new SlashCommandBuilder()
		.setName('보조금받기')
		.setDescription('아끼다 다른 사람한테 넘어간다ㅋㅋ'),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();

			// User가 가지고 있는 주식과 현금을 합친 돈이 젤 적은사람
			const nowMinUser = userController.getMinUser();

			if (nowMinUser.getId() !== discordId) {
				await interaction.reply({ content: '꼴찌도 아닌 놈이 받을려해! 갈!!!!!!!!' });
				return;
			}

			const money = globalController.getGrantMoney();
			nowMinUser.updateMoney(money);
			await interaction.reply({
				content: `${setComma(money)}원을 받았습니다.`,
			});
			globalController.updateGrantMoney(0);
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
