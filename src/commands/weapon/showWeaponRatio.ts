import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import _ from 'lodash';
import dependency from '../../config/dependencyInjection';
import { setComma } from '../../config/util';
import Game from '../../controller/Game';
import weaponController from '../../controller/weaponController';

const {
	cradle: { logger },
} = dependency;

export default {
	data: new SlashCommandBuilder().setName('무기확률').setDescription('무기확률표'),
	async execute(interaction: ChatInputCommandInteraction, game: Game) {
		try {
			const embedBox = new EmbedBuilder();
			embedBox
				.setColor('#0099ff')
				.setTitle('강화 확률표')
				.setDescription('(성공/실패/터질확률) - 돈')
				.addFields({ name: '\u200B', value: '\u200B' })
				.setTimestamp();

			const { ratioList: list, value } = game.weapon.swordInfo;
			let money = value;
			for (let i = 0; i < Math.floor(list.length / 5); i++) {
				let value = '';
				// eslint-disable-next-line no-loop-func
				list.slice(i * 5, (i + 1) * 5).forEach((weaponInfo, idx) => {
					const fail = _.round(weaponInfo.failRatio * 100, 2);
					const destroy = _.round(weaponInfo.destroyRatio * 100, 2);
					money *= weaponInfo.moneyRatio;
					const success = _.round(100 - destroy - fail, 2);
					value = `${value}\n${i * 5 + idx}~${
						i * 5 + idx + 1
					}: (${success}%/${fail}%/${destroy}%)-${setComma(money, true)}원`;
				});
				embedBox.addFields({
					name: `${i * 5}~${(i + 1) * 5}강`,
					value: value,
					inline: true,
				});
			}

			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
