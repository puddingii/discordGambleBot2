const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {
	cradle: { logger },
} = require('../../config/dependencyInjection');
const { setComma } = require('../../config/util');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('랭킹')
		.setDescription('가지고 있는 돈과 주식 등을 합한 랭킹, 무기강화 수치 등등..'),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const rankingList = game.getUserList().map(user => {
				const money =
					user.stockList.reduce((acc, cur) => {
						acc += cur.cnt * cur.stock.value;
						return acc;
					}, 0) + user.money;
				return {
					name: user.nickname,
					money,
					sword: user.getWeapon('sword')?.curPower ?? 0,
				};
			});

			const embedBox = new EmbedBuilder();
			embedBox
				.setColor('#0099ff')
				.setTitle('랭킹')
				.setDescription('가지고 있는 돈과 주식 등을 합한 랭킹, 무기강화 수치 등등..')
				.addFields({ name: '\u200B', value: '\u200B' })
				.setTimestamp();

			rankingList.forEach(user => {
				embedBox.addFields({
					name: `${user.name}`,
					value: `총 재산: ${setComma(user.money, true)}원\n무기: ${user.sword}강`,
					inline: true,
				});
			});
			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
