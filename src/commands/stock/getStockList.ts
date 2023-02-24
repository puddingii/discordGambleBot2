import {
	SlashCommandBuilder,
	EmbedBuilder,
	ChatInputCommandInteraction,
} from 'discord.js';
import dayjs from 'dayjs';
import stockController from '../../controller/bot/stockController';
import util from '../../config/util';
import { container } from '../../settings/container';
import TYPES from '../../interfaces/containerType';
import { ILogger } from '../../util/logger';

const logger = container.get<ILogger>(TYPES.Logger);

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
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const stockType =
				<'coin' | 'stock' | 'all'>interaction.options.getString('종류') || 'all';
			const condition = stockController.getNextUpdateTime();

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

			const stockList = await stockController.getAllStock();
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
			logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
