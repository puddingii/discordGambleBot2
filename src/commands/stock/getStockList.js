const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dayjs = require('dayjs');
const {
	cradle: { logger, util },
} = require('../../config/dependencyInjection');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('주식리스트')
		.setDescription('주식리스트임. 옵션이 없으면 기본으로 전체가 뜸.')
		.addStringOption(option =>
			option.setName('종류').setDescription('주식인지 코인인지').addChoices(
				{
					name: '주식',
					value: 'stock',
				},
				{
					name: '코인',
					value: 'coin',
				},
				{
					name: '전체',
					value: 'all',
				},
			),
		),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const stockType = interaction.options.getString('종류') || 'all';
			const condition =
				game.gamble.conditionPeriod - (game.gamble.curTime % game.gamble.conditionPeriod);

			const embedBox = new EmbedBuilder();
			embedBox
				.setColor('#0099ff')
				.setTitle('주식 리스트')
				.setDescription(
					`${dayjs().format('M월 DD일')} 주식리스트\n시장흐름 변경까지: ${
						condition * 30
					}분 미만`,
				)
				.addFields({ name: '\u200B', value: '\u200B' })
				.setTimestamp();

			/** DB Info */
			const stockList = game.gamble.getAllStock(stockType);
			stockList.forEach(stock => {
				embedBox.addFields({
					name: `${stock.name} ${
						stock.type === 'stock' ? '주식' : '코인'
					} - ${util.setComma(stock.value, true)}원`,
					value: stock.comment,
				});
			});

			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
