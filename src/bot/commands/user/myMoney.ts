import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import userController from '../../../common/controller/userController';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { IUtil } from '../../../common/util/util';

const util = container.get<IUtil>(TYPES.Util);

export default {
	data: new SlashCommandBuilder().setName('내돈').setDescription('가지고 있는 돈'),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const user = await userController.getUser({ discordId });

			await interaction.reply({
				content: `가지고 있는 돈: ${util.formatter.setComma(user.money, true)}원`,
			});
		} catch (err) {
			util.logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
