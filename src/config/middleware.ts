import discord from 'discord.js';
import dependency from './dependencyInjection';

const {
	cradle: { UserModel, logger },
} = dependency;

export const isEnrolledUser = async function (interaction: discord.CommandInteraction) {
	const discordId = interaction.user.id.toString();
	const userInfo = await UserModel.findByDiscordId(discordId);
	if (!userInfo) {
		logger.warn('유저정보를 찾을 수 없습니다. 유저등록 커맨드를 먼저 입력해주세요');
		return false;
	}

	return true;
};

export default { isEnrolledUser };
