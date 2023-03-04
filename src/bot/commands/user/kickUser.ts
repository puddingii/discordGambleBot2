import {
	SlashCommandBuilder,
	ChannelType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { ILogger } from '../../../common/util/logger';

const logger = container.get<ILogger>(TYPES.Logger);

export default {
	data: new SlashCommandBuilder()
		.setName('유저킥')
		.setDescription('음성채팅방에서 킥할 유저를 고르셈')
		.addUserOption(option => option.setName('유저').setDescription('킥할 유저를 고르쉠'))
		.addChannelOption(option =>
			option
				.setName('채널')
				.setDescription('무야호')
				.addChannelTypes(ChannelType.GuildVoice),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const user = interaction.options.getUser('유저');
			const selectedChannel = interaction.options.getChannel('채널');
			if (user && interaction.channel?.isVoiceBased()) {
				const kickedUser = interaction.channel?.members.get(user.id);
			}
			// kickedUser.voice.disconnect('ㅋㅋ');

			await interaction.reply({ content: '테스트' });
		} catch (err) {
			logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
