const {
	cradle: { UserModel, logger },
} = require('./dependencyInjection');

/** @param {import('discord.js').CommandInteraction} interaction */
const isEnrolledUser = async function (interaction) {
	const discordId = interaction.user.id.toString();
	const userInfo = await UserModel.findByDiscordId(discordId);
	if (!userInfo) {
		logger.warn('유저정보를 찾을 수 없습니다. 유저등록 커맨드를 먼저 입력해주세요');
		return false;
	}

	return true;
};

module.exports = {
	isEnrolledUser,
};
