import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { IUtil } from '../../../common/util';
import { IUserController } from '../../../interfaces/common/controller/user';

const util = container.get<IUtil>(TYPES.Util);
const userController = container.get<IUserController>(TYPES.UserController);

export default {
	data: new SlashCommandBuilder()
		.setName('돈선물모두받기')
		.setDescription('선물목록에 있는 돈 모두 받기'),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const totalMoney = await userController.receiveAllGiftMoney(discordId);
			await interaction.reply({
				content: `${util.formatter.setComma(totalMoney, true)}원 획득`,
			});
		} catch (err) {
			util.logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
