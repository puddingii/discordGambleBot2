import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	SelectMenuInteraction,
	SlashCommandBuilder,
} from 'discord.js';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { ILogger } from '../../../common/util/logger';
import { getEnhanceButton, getSelectMenu } from './subCommand/enhanceWeapon';
import { IUserWeaponController } from '../../../interfaces/common/controller/userWeapon';

const logger = container.get<ILogger>(TYPES.Logger);
const userWeaponController = container.get<IUserWeaponController>(
	TYPES.UserWeaponController,
);

export default {
	data: new SlashCommandBuilder().setName('무기강화').setDescription('무기를 강화함'),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			const menu = await getSelectMenu(interaction.user.id.toString());

			await interaction.reply({
				content: '강화할 무기를 먼저 선택해주세요',
				components: [menu],
			});
		} catch (err) {
			logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
	async select(interaction: SelectMenuInteraction) {
		try {
			await interaction.deferUpdate();
			const selectedList = interaction.values;
			const [weaponType, weaponName] = selectedList[0].split('/');
			const owner = interaction.customId.split('&')[1];
			await interaction.editReply({
				content: `버튼을 눌러 강화ㄱㄱ`,
				components: [getEnhanceButton(owner, weaponType, weaponName)],
			});
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(errorMessage, ['Command']);
			await interaction.editReply({
				content: `${errorMessage}`,
			});
		}
	},
	async buttonClick(interaction: ButtonInteraction) {
		try {
			await interaction.deferUpdate();
			const [interactionInfo, owner] = interaction.customId.split('&');
			const clickInfo = interactionInfo.split('-')[1].split('/');
			const type = clickInfo[1];
			const name = clickInfo[2];
			const discordId = interaction.user.id.toString();

			const { code, curPower, beforePower } = await userWeaponController.enhanceWeapon({
				discordId,
				type,
				isPreventDestroy: false,
				isPreventDown: false,
			});

			let content = `${beforePower}강 ▶︎ ${curPower}강 `;
			switch (code) {
				case 2:
					content = `실패! ${content}`;
					break;
				case 3:
					content = `터짐ㅋㅋ ${content}`;
					break;
				default:
					content = `성공! ${content}`;
			}

			await interaction.editReply({
				content: `${name} ${content}`,
				components: [getEnhanceButton(owner, type, name)],
			});
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(errorMessage, ['Command']);
			await interaction.editReply({
				content: `${errorMessage}`,
			});
		}
	},
};
