import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import _ from 'lodash';
import weaponController from '../../controller/bot/weaponController';
import { container } from '../../settings/container';
import TYPES from '../../interfaces/containerType';
import { IUtil } from '../../util/util';

const util = container.get<IUtil>(TYPES.Util);

// FIXME 여기도 바꿔야함
export default {
	data: new SlashCommandBuilder().setName('무기확률').setDescription('무기확률표'),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			const embedBox = new EmbedBuilder();
			embedBox
				.setColor('#0099ff')
				.setTitle('강화 확률표')
				.setDescription('(성공/실패/터질확률) - 돈')
				.addFields({ name: '\u200B', value: '\u200B' })
				.setTimestamp();

			const list = await weaponController.getEnhanceInfoList('sword');
			const listLen = list.length;
			const PERCNT = 5;
			for (let i = 0; i < listLen; i += PERCNT) {
				let value = '';
				for (let j = i; j < i + PERCNT && j < listLen; j++) {
					const fail = _.round(list[j].fail * 100, 2);
					const destroy = _.round(list[j].destroy * 100, 2);
					const success = _.round(list[j].success * 100, 2);
					value = `${value}\n${j}~${
						j + 1
					}: (${success}%/${fail}%/${destroy}%)-${util.formatter.setComma(
						list[j].cost,
						true,
					)}원`;
				}
				embedBox.addFields({
					name: `${i}~${i + PERCNT >= listLen ? listLen : i + PERCNT}강`,
					value,
					inline: true,
				});
			}

			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			util.logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
