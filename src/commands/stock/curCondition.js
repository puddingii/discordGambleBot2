const { SlashCommandBuilder } = require('discord.js');
const {
	cradle: { UserModel, logger },
} = require('../../config/dependencyInjection');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('주식흐름')
		.setDescription(
			'주식 흐름임. 주식 종류에 따라 이 영향을 많이 받을수도 아닐수도 있음. [비용: 1만원]',
		),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const condition = game.gamble.curCondition;
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

			const result = game.gamble.updateMoney(discordId, -10000);
			if (!result.code) {
				await interaction.reply({ content: result.message, ephemeral: true });
				return;
			}
			const dbResult = await UserModel.updateMoney([result.userInfo]);
			if (!dbResult.code) {
				await interaction.reply({ content: dbResult.message, ephemeral: true });
				return;
			}

			await interaction.reply({ content: conditionText, ephemeral: true });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
