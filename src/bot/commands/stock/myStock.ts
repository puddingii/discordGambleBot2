import {
	SlashCommandBuilder,
	EmbedBuilder,
	ChatInputCommandInteraction,
} from 'discord.js';
import dayjs from 'dayjs';
import _ from 'lodash';
import userController from '../../../controller/userController';
import util from '../../../config/util';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { ILogger } from '../../../util/logger';

const logger = container.get<ILogger>(TYPES.Logger);

export default {
	data: new SlashCommandBuilder().setName('내주식').setDescription('내 주식임'),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const embedBox = new EmbedBuilder();
			embedBox
				.setColor('#0099ff')
				.setTitle('내 주식 리스트')
				.setDescription(`${dayjs().format('M월 DD일')} 내 주식리스트`)
				.addFields({ name: '\u200B', value: '\u200B' })
				.setTimestamp();

			/** DB Info */
			const { stockList, totalMyValue, totalStockValue } =
				await userController.getMyStockList(discordId);

			const totalCalc = stockList.reduce((acc, stock) => {
				acc += stock.profilMargin;
				embedBox.addFields({
					name: `${stock.name} ${
						stock.stockType === 'stock' ? '주식' : '코인'
					} - ${util.setComma(stock.stockValue, true)}원`,
					value: `내 포지션: ${util.setComma(
						stock.myValue,
						true,
					)}원\n손익,수익률: ${util.setComma(stock.profilMargin, true)}원 (${
						stock.myRatio
					}%)\n보유비중: ${stock.cnt}개 | ${_.round(
						((stock.cnt * stock.myValue) / totalMyValue) * 100,
						2,
					)}%`,
				});
				return acc;
			}, 0);

			embedBox.addFields({ name: '\u200B', value: '\u200B' }).addFields({
				name: '요약',
				value: `총 투자액: ${util.setComma(
					totalMyValue,
					true,
				)}원\n총 주식평단가: ${util.setComma(
					totalStockValue,
					true,
				)}원\n총 수익: ${util.setComma(totalCalc, true)}원\n총 수익률: ${_.round(
					(totalStockValue / totalMyValue - 1) * 100,
					2,
				)}%`,
			});

			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
