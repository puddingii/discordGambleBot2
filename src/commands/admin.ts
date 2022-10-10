import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	ModalSubmitInteraction,
	SelectMenuBuilder,
	SelectMenuInteraction,
	SlashCommandBuilder,
} from 'discord.js';
import dependency from '../config/dependencyInjection';
import stockManager from './admin/stockManager';
import userManager from './admin/userManager';
import statusManager from './admin/gameStatusManager';
import { getNewSelectMenu } from './admin/common';
import Game from '../controller/Game';

const {
	cradle: { logger, secretKey },
} = dependency;

const {
	modalSubmit: { updateStock },
	select: { showStockModal },
} = stockManager;

const {
	modalSubmit: { giveMoney },
	select: { showGiveMoneyModal },
} = userManager;

const {
	modalSubmit: { updateStatus },
	select: { showGameStatusModal },
} = statusManager;

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
			logger.error(errorMessage);
			await interaction.reply({
				content: `${errorMessage}`,
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
		}
	},
	async select(
		interaction: SelectMenuInteraction,
		game: Game,
		{ selectedList }: { selectedList: string[] },
	) {
		try {
			const command = selectedList[0].split('-');
			const stockList = game.gamble.getAllStock().map(stock => ({
				label: stock.name,
				value: `updateStock-${stock.name}`,
				description: stock.type,
			}));
			switch (command[0]) {
				case 'showAddStockModal': // 주식종류 추가하는 모달창 띄우기
					await showStockModal(interaction);
					break;
				case 'updateStock': // 주식 업데이트
					await showStockModal(interaction, game, command[1]);
					break;
				case 'selectStock': // 주식 업데이트에서 누른 주식
					await interaction.reply({
						content: '어드민전용-업데이트할 주식',
						components: [
							new ActionRowBuilder<SelectMenuBuilder>().addComponents(
								new SelectMenuBuilder()
									.setCustomId('어드민')
									.setPlaceholder('주식 리스트')
									.addOptions(stockList),
							),
						],
						ephemeral: true,
					});
					break;
				case 'showGiveMoneyModal':
					await showGiveMoneyModal(interaction);
					break;
				case 'showGameStatusModal':
					await showGameStatusModal(interaction, game);
					break;
				default:
					break;
			}
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(errorMessage);
			await interaction.reply({
				content: `${errorMessage}`,
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
		}
	},
	async modalSubmit(
		interaction: ModalSubmitInteraction,
		game: Game,
		{ callFuncName }: { callFuncName: string },
	) {
		try {
			switch (callFuncName) {
				case 'addStock':
					await updateStock(interaction, game, true);
					break;
				case 'updateStock':
					await updateStock(interaction, game);
					break;
				case 'giveMoney':
					await giveMoney(interaction, game);
					break;
				case 'updateStatus':
					await updateStatus(interaction, game);
					break;
				default:
			}
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(errorMessage);
			await interaction.reply({
				content: `${errorMessage}`,
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
		}
	},
};
