const { SlashCommandBuilder } = require('discord.js');
const {
	cradle: { UserModel, logger },
} = require('../../config/dependencyInjection');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('주식매도')
		.setDescription('주식 or 코인 사기')
		.addStringOption(option =>
			option.setName('이름').setDescription('주식이름').setRequired(true),
		)
		.addNumberOption(option =>
			option.setName('수량').setDescription('몇개나 팔건지').setRequired(true),
		),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const name = interaction.options.getString('이름');
			const cnt = Math.floor(interaction.options.getNumber('수량'));

			if (cnt < 1) {
				await interaction.reply({ content: '갯수를 입력해주세요' });
				return;
			}

			const gambleResult = game.gamble.buySellStock(discordId, name, cnt * -1, false);
			if (!gambleResult.code) {
				await interaction.reply({ content: gambleResult.message });
				return;
			}
			const dbResult = await UserModel.updateStock(discordId, {
				name,
				cnt: gambleResult.cnt,
				value: gambleResult.value,
				money: gambleResult.money,
			});
			if (!dbResult.code) {
				await interaction.reply({ content: dbResult.message });
				return;
			}

			await interaction.reply({ content: '매도완료!' });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
