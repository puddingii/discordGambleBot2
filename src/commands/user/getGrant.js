const { SlashCommandBuilder } = require('discord.js');
const {
	cradle: { UserModel, logger },
} = require('../../config/dependencyInjection');
const { setComma } = require('../../config/util');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('보조금받기')
		.setDescription('아끼다 다른 사람한테 넘어간다ㅋㅋ'),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();

			const rankingList = game.getUserList();
			const nowMinUser = rankingList.reduce((minUser, user) => {
				const getTotalMoney = info =>
					info.stockList.reduce((acc, cur) => {
						acc += cur.cnt * cur.stock.value;
						return acc;
					}, 0) + info.money;

				const afterMoney = getTotalMoney(user);
				const beforeMoney = getTotalMoney(minUser);

				return afterMoney - beforeMoney > 0 ? minUser : user;
			}, rankingList[0]);

			if (nowMinUser.getId() !== discordId) {
				await interaction.reply({ content: '꼴찌도 아닌 놈이 받을려해! 갈!!!!!!!!' });
				return;
			}

			nowMinUser.updateMoney(game.grantMoney);
			await UserModel.updateMoney([nowMinUser]);

			await interaction.reply({
				content: `${setComma(game.grantMoney)}원을 받았습니다.`,
			});
			game.grantMoney = 0;
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
