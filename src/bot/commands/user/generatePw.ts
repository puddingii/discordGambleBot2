import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import userController from '../../../common/controller/userController';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { ILogger } from '../../../common/util/logger';

const logger = container.get<ILogger>(TYPES.Logger);

export default {
	data: new SlashCommandBuilder()
		.setName('비밀번호발급')
		.setDescription(
			'웹으로 접속하기 위한 비밀번호 발급[기존 비밀번호가 있을시, 기존 비밀번호 제거후 재발급.]',
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();

			const myPassword = await userController.generatePassword(discordId);
			await interaction.reply({
				content: `비밀번호 (재)생성 완료 : ${myPassword}`,
				ephemeral: true,
			});
		} catch (err) {
			logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
