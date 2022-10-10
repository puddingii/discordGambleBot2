import {
	SlashCommandBuilder,
	EmbedBuilder,
	ChatInputCommandInteraction,
} from 'discord.js';
import dayjs from 'dayjs';
import dependency from '../../config/dependencyInjection';
import Game from '../../controller/Game';

const {
	cradle: { logger, util },
} = dependency;

export default {
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
	async execute(interaction: ChatInputCommandInteraction, game: Game) {
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
			const stockTypeList = ['coin', 'stock', 'all'];
			if (!stockTypeList.includes(stockType)) {
				await interaction.reply({ content: 'Builder Error' });
				return;
			}
			const stockList = game.gamble.getAllStock(<'coin' | 'stock' | 'all'>stockType);
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
