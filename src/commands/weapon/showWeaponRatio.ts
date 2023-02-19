import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import weaponController from '../../controller/bot/weaponController';
import { container } from '../../settings/container';
import TYPES from '../../interfaces/containerType';
import { ILogger } from '../../util/logger';

const logger = container.get<ILogger>(TYPES.Logger);

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

			const list = weaponController.getFormattedRatioList('sword', 5);

			list.forEach(info => {
				embedBox.addFields({
					name: info.name,
					value: info.value,
					inline: true,
				});
			});

			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
