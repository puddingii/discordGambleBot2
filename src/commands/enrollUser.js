const { SlashCommandBuilder } = require('discord.js');
const {
	cradle: { UserModel, logger },
} = require('../config/dependencyInjection');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('유저등록')
		.setDescription('봇 게임에 참여하기 위해 유저등록. 등록하기전에는 참여하지 못함')
		.addStringOption(option =>
			option.setName('유저닉네임').setDescription('닉네임').setRequired(true),
		),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const nickname = interaction.options.getString('유저닉네임');

			/** DB Info */
			const userInfo = await UserModel.findByDiscordId(discordId);

			/** 유저정보가 없을 때 */
			if (!userInfo) {
				await UserModel.create({ discordId, nickname });
				game.addUser({ id: discordId, nickname });
				await interaction.reply({
					content: '유저등록 완료! 이제부터 게임에 참여 가능합니다',
				});
				return;
			}

			await interaction.reply({ content: '이미 등록된 유저입니다.' });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
