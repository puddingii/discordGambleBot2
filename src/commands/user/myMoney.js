const { SlashCommandBuilder } = require('discord.js');
const {
	cradle: { logger },
} = require('../../config/dependencyInjection');
const { setComma } = require('../../config/util');

module.exports = {
	data: new SlashCommandBuilder().setName('내돈').setDescription('가지고 있는 돈'),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();

			const userInfo = game.getUser({ discordId });

			await interaction.reply({
				content: `가지고 있는 돈: ${setComma(userInfo.money, true)}원`,
			});
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
