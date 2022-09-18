const { SlashCommandBuilder, ChannelType } = require('discord.js');
const {
	cradle: { UserModel, logger },
} = require('../../config/dependencyInjection');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('유저킥')
		.setDescription('음성채팅방에서 킥할 유저를 고르셈')
		.addUserOption(option => option.setName('유저').setDescription('킥할 유저를 고르쉠'))
		.addChannelOption(option =>
			option
				.setName('채널')
				.setDescription('무야호')
				.addChannelTypes(ChannelType.GuildVoice),
		),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const user = interaction.options.getUser('유저');
			const selectedChannel = interaction.options.getChannel('채널');
			const kickedUser = interaction.channel.members.get(user.id);
			// kickedUser.voice.disconnect('ㅋㅋ');

			await interaction.reply({ content: '테스트' });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
