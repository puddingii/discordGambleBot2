import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { IUserController } from '../../../interfaces/common/controller/user';
import { IStatusController } from '../../../interfaces/common/controller/status';
import { ILogger } from '../../../interfaces/common/util/logger';

const logger = container.get<ILogger>(TYPES.Logger);
const userController = container.get<IUserController>(TYPES.UserController);
const statusController = container.get<IStatusController>(TYPES.StatusController);

export default {
	data: new SlashCommandBuilder()
		.setName('주식흐름')
		.setDescription(
			'주식 흐름임. 주식 종류에 따라 이 영향을 많이 받을수도 아닐수도 있음. [비용: 1만원]',
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const { curCondition: condition } = await statusController.getGambleStatus();
			let conditionText = '';
			switch (condition) {
				case 1:
					conditionText = '씹악재';
					break;
				case 2:
					conditionText = '악재';
					break;
				case 3:
					conditionText = '호재';
					break;
				case 4:
					conditionText = '씹호재';
					break;
				default:
					conditionText = '아무일도 없음';
			}

			await userController.updateMoney({ discordId }, -10000);

			await interaction.reply({ content: conditionText, ephemeral: true });
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(errorMessage, ['Command']);
			await interaction.reply({ content: `${errorMessage}`, ephemeral: true });
		}
	},
};
