import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { setComma } from '../../config/util';
import globalController from '../../controller/statusController';
import { container } from '../../settings/container';
import TYPES from '../../interfaces/containerType';
import { ILogger } from '../../util/logger';

const logger = container.get<ILogger>(TYPES.Logger);

export default {
	data: new SlashCommandBuilder()
		.setName('보조금누적액')
		.setDescription('보조금 누적액수'),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			const money = await globalController.getGrantMoney();
			await interaction.reply({
				content: `${setComma(money, true)}원 누적되어 있음.`,
			});
		} catch (err) {
			logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
