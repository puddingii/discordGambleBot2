import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { IUserController } from '../../../interfaces/common/controller/user';
import { ILogger } from '../../../interfaces/common/util/logger';

const logger = container.get<ILogger>(TYPES.Logger);
const userController = container.get<IUserController>(TYPES.UserController);

export default {
	data: new SlashCommandBuilder()
		.setName('유저등록')
		.setDescription('봇 게임에 참여하기 위해 유저등록. 등록하기전에는 참여하지 못함')
		.addStringOption(option =>
			option.setName('유저닉네임').setDescription('닉네임').setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const nickname = interaction.options.getString('유저닉네임') ?? '';

			await userController.addUser({ id: discordId, nickname });
			await interaction.reply({
				content: '유저등록 완료! 이제부터 게임에 참여 가능합니다',
			});
		} catch (err) {
			logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
