const { SlashCommandBuilder } = require('discord.js');
const {
	cradle: { UserModel, logger },
} = require('../../config/dependencyInjection');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('돈기부')
		.setDescription('다른 유저에게 돈 주기')
		.addStringOption(option =>
			option.setName('상대방').setDescription('상대방 닉네임').setRequired(true),
		)
		.addNumberOption(option =>
			option.setName('액수').setDescription('얼마나 줄건지').setRequired(true),
		),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const ptrNickname = interaction.options.getString('상대방');
			const cnt = Math.floor(interaction.options.getNumber('액수'));

			if (cnt < 1) {
				await interaction.reply({ content: '마이너스 값은 입력이 안됩니다.' });
				return;
			}

			const myInfo = game.getUser({ discordId });
			const ptrInfo = game.getUser({ nickname: ptrNickname });
			if (!myInfo || !ptrInfo) {
				await interaction.reply({ content: '유저정보가 없습니다.' });
				return;
			}

			const { code, message } = myInfo.updateMoney(cnt * -1);
			if (!code) {
				await interaction.reply({ content: message });
				return;
			}
			ptrInfo.updateMoney(cnt);

			await UserModel.updateMoney([myInfo, ptrInfo]);

			await interaction.reply({ content: '기부완료!' });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
