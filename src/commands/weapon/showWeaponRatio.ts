import {
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import dependency from '../../config/dependencyInjection';
import weaponController from '../../controller/weaponController';

const {
	cradle: { logger },
} = dependency;

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
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
