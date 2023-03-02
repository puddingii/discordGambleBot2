import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	ModalSubmitInteraction,
	SelectMenuBuilder,
	SelectMenuInteraction,
	SlashCommandBuilder,
} from 'discord.js';
import stockAdmin from './subCommand/stockAdmin';
import userAdmin from './subCommand/userAdmin';
import weaponAdmin from './subCommand/weaponAdmin';
import gameStatusAdmin from './subCommand/gameStatusAdmin';
import { getNewSelectMenu } from './subCommand/common';
import secretKey from '../../../config/secretKey';
import client from '../../../app';
import { container } from '../../../settings/container';
import TYPES from '../../../interfaces/containerType';
import { ILogger } from '../../../util/logger';

const logger = container.get<ILogger>(TYPES.Logger);

const {
	modalSubmit: { updateStock },
	select: { showStockModal, showStockList },
} = stockAdmin;

const {
	modalSubmit: { giveMoney },
	select: { showGiveMoneyModal },
} = userAdmin;

const {
	modalSubmit: { updateWeapon },
	select: { showWeaponModal, showWeaponList },
} = weaponAdmin;

const {
	modalSubmit: { updateStatus },
	select: { showGameStatusModal },
} = gameStatusAdmin;

export default {
	data: new SlashCommandBuilder()
		.setName('어드민')
		.setDescription('관리자만 접속할 수 있다.')
		.addStringOption(option =>
			option.setName('아이디').setDescription('아이디').setRequired(true),
		)
		.addStringOption(option =>
			option.setName('비밀번호').setDescription('비밀번호').setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const adminId = interaction.options.getString('아이디');
			const adminPw = interaction.options.getString('비밀번호');

			if (adminId !== secretKey.adminId || adminPw !== secretKey.adminPw) {
				await interaction.reply({
					content: '아이디와 비밀번호를 확인해주세요',
					ephemeral: true,
				});
				return;
			}

			await interaction.reply({
				content: '어드민전용-관리옵션',
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(errorMessage, ['Command']);
			await interaction.reply({
				content: `${errorMessage}`,
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
		}
	},
	async select(
		interaction: SelectMenuInteraction,
		{ selectedList }: { selectedList: string[] },
	) {
		try {
			const command = selectedList[0].split('-');

			switch (command[0]) {
				case 'showAddStockModal': // 주식종류 추가하는 모달창 띄우기
					await showStockModal(interaction);
					break;
				case 'updateStock': // 주식 업데이트
					await showStockModal(interaction, command[1]);
					break;
				case 'selectStock': // 주식 업데이트에서 누른 주식
					await showStockList(interaction);
					break;
				case 'showAddWeaponModal': // 무기 추가하는 모달창 띄우기
					await showWeaponModal(interaction);
					break;
				case 'updateWeapon': // 무기 업데이트
					await showWeaponModal(interaction, command[1]);
					break;
				case 'selectWeapon': // 무기 업데이트에서 누른 무기
					await showWeaponList(interaction);
					break;
				case 'showGiveMoneyModal':
					await showGiveMoneyModal(interaction);
					break;
				case 'showGameStatusModal':
					await showGameStatusModal(interaction);
					break;
				case 'selectBotStatus':
					await interaction.reply({
						content: '어드민전용-봇상태 업데이트',
						components: [
							new ActionRowBuilder<SelectMenuBuilder>().addComponents(
								new SelectMenuBuilder()
									.setCustomId('어드민')
									.setPlaceholder('주식 리스트')
									.addOptions([
										{
											label: 'good',
											value: 'updateBotStatus-online',
											description: '정상작동',
										},
										{
											label: 'stop',
											value: 'updateBotStatus-idle',
											description: '일시정지',
										},
										{
											label: 'bad',
											value: 'updateBotStatus-dnd',
											description: '긴급정지',
										},
									]),
							),
						],
						ephemeral: true,
					});
					break;
				case 'updateBotStatus':
					client.user?.setStatus(<'online' | 'idle' | 'dnd'>command[1]);
					await interaction.reply({
						content: '변경 완료',
						components: [getNewSelectMenu()],
						ephemeral: true,
					});
					break;
				default:
					break;
			}
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(errorMessage, ['Command']);
			await interaction.reply({
				content: `${errorMessage}`,
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
		}
	},
	async modalSubmit(
		interaction: ModalSubmitInteraction,
		{ callFuncName }: { callFuncName: string },
	) {
		try {
			switch (callFuncName) {
				case 'addStock':
					await updateStock(interaction, true);
					break;
				case 'updateStock':
					await updateStock(interaction);
					break;
				case 'giveMoney':
					await giveMoney(interaction);
					break;
				case 'updateStatus':
					await updateStatus(interaction);
					break;
				case 'addWeapon':
					await updateWeapon(interaction, true);
					break;
				case 'updateWeapon':
					await updateWeapon(interaction);
					break;
				default:
			}
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(errorMessage, ['Command']);
			await interaction.reply({
				content: `${errorMessage}`,
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
		}
	},
};
