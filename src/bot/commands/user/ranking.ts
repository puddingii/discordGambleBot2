import {
	SlashCommandBuilder,
	EmbedBuilder,
	ChatInputCommandInteraction,
} from 'discord.js';
import userController from '../../../common/controller/userController';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { IUtil } from '../../../common/util/util';

const util = container.get<IUtil>(TYPES.Util);

export default {
	data: new SlashCommandBuilder()
		.setName('랭킹')
		.setDescription('가지고 있는 돈과 주식 등을 합한 랭킹, 무기강화 수치 등등..'),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			const embedBox = new EmbedBuilder();
			embedBox
				.setColor('#0099ff')
				.setTitle('랭킹')
				.setDescription('가지고 있는 돈과 주식 등을 합한 랭킹, 무기강화 수치 등등..')
				.addFields({ name: '\u200B', value: '\u200B' })
				.setTimestamp();

			const rankingList = (await userController.getRankingList()).sort(
				(a, b) => b.money - a.money,
			);

			rankingList.forEach(user => {
				embedBox.addFields({
					name: `${user.name}`,
					value: `총 재산: ${util.formatter.setComma(user.money, true)}원`,
					inline: true,
				});
			});
			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			util.logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
