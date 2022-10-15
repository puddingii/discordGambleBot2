import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import dependency from '../../config/dependencyInjection';
import globalController from '../../controller/globalController';

const {
	cradle: {
		logger,
		util: { setComma },
	},
} = dependency;

export default {
	data: new SlashCommandBuilder()
		.setName('보조금누적액')
		.setDescription('보조금 누적액수'),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			await interaction.reply({
				content: `${setComma(globalController.getGrantMoney(), true)}원 누적되어 있음.`,
			});
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
