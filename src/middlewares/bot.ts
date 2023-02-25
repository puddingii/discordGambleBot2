import {
	CommandInteraction,
	ModalSubmitInteraction,
	SelectMenuInteraction,
} from 'discord.js';
import userController from '../controller/userController';
import { container } from '../settings/container';
import TYPES from '../interfaces/containerType';
import { ILogger } from '../util/logger';

export const isEnrolledUser = async function (
	interaction: CommandInteraction | ModalSubmitInteraction | SelectMenuInteraction,
) {
	const logger = container.get<ILogger>(TYPES.Logger);
	try {
		const discordId = interaction.user.id.toString();
		const userInfo = await userController.getUser({ discordId });

		if (!userInfo) {
			logger.warn('유저정보를 찾을 수 없습니다. 유저등록 커맨드를 먼저 입력해주세요', [
				'Middleware',
			]);
			return false;
		}
		return true;
	} catch (e) {
		logger.warn('유저정보를 찾을 수 없습니다. 유저등록 커맨드를 먼저 입력해주세요', [
			'Middleware',
		]);
		return false;
	}
};

export default { isEnrolledUser };
