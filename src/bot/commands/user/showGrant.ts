import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import globalController from '../../../common/controller/statusController';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { IUtil } from '../../../common/util/util';

const util = container.get<IUtil>(TYPES.Util);

export default {
	data: new SlashCommandBuilder()
		.setName('보조금누적액')
		.setDescription('보조금 누적액수'),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			const money = await globalController.getGrantMoney();
			await interaction.reply({
				content: `${util.formatter.setComma(money, true)}원 누적되어 있음.`,
			});
		} catch (err) {
			util.logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
