import {
	SlashCommandBuilder,
	EmbedBuilder,
	ChatInputCommandInteraction,
} from 'discord.js';
import dayjs from 'dayjs';
import _ from 'lodash';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { IUserController } from '../../../interfaces/common/controller/user';
import { IUtil } from '../../../interfaces/common/util';

const util = container.get<IUtil>(TYPES.Util);
const userController = container.get<IUserController>(TYPES.UserController);

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
					} - ${util.formatter.setComma(stock.stockValue, true)}원`,
					value: `내 포지션: ${util.formatter.setComma(
						stock.myValue,
						true,
					)}원\n손익,수익률: ${util.formatter.setComma(stock.profilMargin, true)}원 (${
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
				value: `총 투자액: ${util.formatter.setComma(
					totalMyValue,
					true,
				)}원\n총 주식평단가: ${util.formatter.setComma(
					totalStockValue,
					true,
				)}원\n총 수익: ${util.formatter.setComma(
					totalCalc,
					true,
				)}원\n총 수익률: ${_.round((totalStockValue / totalMyValue - 1) * 100, 2)}%`,
			});

			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			util.logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
