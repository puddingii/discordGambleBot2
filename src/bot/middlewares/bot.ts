import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
} from 'discord.js';
import { container } from '../../settings/container';
import TYPES from '../../interfaces/containerType';
import { ILogger } from '../../common/util/logger';
import { IUserController } from '../../interfaces/common/controller/user';

const logger = container.get<ILogger>(TYPES.Logger);
const userController = container.get<IUserController>(TYPES.UserController);

export const isEnrolledUser = async function (
	interaction:
		| ChatInputCommandInteraction
		| ModalSubmitInteraction
		| StringSelectMenuInteraction
		| ButtonInteraction,
) {
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
