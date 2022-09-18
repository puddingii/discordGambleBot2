const { SlashCommandBuilder } = require('discord.js');
const {
	cradle: { logger },
} = require('../../config/dependencyInjection');
const { setComma } = require('../../config/util');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('보조금누적액')
		.setDescription('보조금 누적액수'),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			await interaction.reply({
				content: `${setComma(game.grantMoney, true)}원 누적되어 있음.`,
			});
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
