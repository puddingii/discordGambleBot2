import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { IUtil } from '../../../common/util';
import { IUserController } from '../../../interfaces/common/controller/user';

const util = container.get<IUtil>(TYPES.Util);
const userController = container.get<IUserController>(TYPES.UserController);

export default {
	data: new SlashCommandBuilder()
		.setName('보조금받기')
		.setDescription('아끼다 다른 사람한테 넘어간다ㅋㅋ'),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const money = await userController.giveGrantMoney(discordId);

			await interaction.reply({
				content: `${util.formatter.setComma(money, true)}원을 받았습니다.`,
			});
		} catch (err) {
			util.logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
