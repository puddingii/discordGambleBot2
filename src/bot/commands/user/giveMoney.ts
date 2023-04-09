import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { IUserController } from '../../../interfaces/common/controller/user';
import { ILogger } from '../../../interfaces/common/util/logger';

const logger = container.get<ILogger>(TYPES.Logger);
const userController = container.get<IUserController>(TYPES.UserController);

export default {
	data: new SlashCommandBuilder()
		.setName('돈기부')
		.setDescription('다른 유저에게 돈 주기')
		.addStringOption(option =>
			option.setName('상대방').setDescription('상대방 닉네임').setRequired(true),
		)
		.addNumberOption(option =>
			option.setName('액수').setDescription('얼마나 줄건지').setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const ptrNickname = interaction.options.getString('상대방') ?? '';
			const cnt = Math.floor(interaction.options.getNumber('액수') ?? 0);

			if (cnt < 1) {
				await interaction.reply({ content: '마이너스 값은 입력이 안됩니다.' });
				return;
			}

			await userController.giveMoney({ discordId }, { nickname: ptrNickname }, cnt);

			await interaction.reply({ content: '기부완료!' });
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(errorMessage, ['Command']);
			await interaction.reply({ content: `${errorMessage}` });
		}
	},
};
