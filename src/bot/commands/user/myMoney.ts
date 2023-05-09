import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { IUserController } from '../../../interfaces/common/controller/user';
import { IUtil } from '../../../interfaces/common/util';

const util = container.get<IUtil>(TYPES.Util);
const userController = container.get<IUserController>(TYPES.UserController);

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
