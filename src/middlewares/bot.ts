import {
	CommandInteraction,
	ModalSubmitInteraction,
	SelectMenuInteraction,
} from 'discord.js';
import userController from '../controller/bot/userController';
import logger from '../config/logger';

export const isEnrolledUser = function (
	interaction: CommandInteraction | ModalSubmitInteraction | SelectMenuInteraction,
) {
	try {
		const discordId = interaction.user.id.toString();
		const userInfo = userController.getUser({ discordId });
		if (!userInfo) {
			logger.warn('유저정보를 찾을 수 없습니다. 유저등록 커맨드를 먼저 입력해주세요');
			return false;
		}
		return true;
	} catch (e) {
		logger.warn('유저정보를 찾을 수 없습니다. 유저등록 커맨드를 먼저 입력해주세요');
		return false;
	}
};

export default { isEnrolledUser };
