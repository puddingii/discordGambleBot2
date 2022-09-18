const {
	ActionRowBuilder,
	SelectMenuBuilder,
	SlashCommandBuilder,
} = require('discord.js');
const {
	cradle: { logger, secretKey },
} = require('../config/dependencyInjection');
const {
	modalSubmit: { updateStock },
	select: { showStockModal },
} = require('./admin/stockManager');
const {
	modalSubmit: { giveMoney },
	select: { showGiveMoneyModal },
} = require('./admin/userManager');
const {
	modalSubmit: { updateStatus },
	select: { showGameStatusModal },
} = require('./admin/gameStatusManager');
const { getNewSelectMenu } = require('./admin/common');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('어드민')
		.setDescription('관리자만 접속할 수 있다.')
		.addStringOption(option =>
			option.setName('아이디').setDescription('아이디').setRequired(true),
		)
		.addStringOption(option =>
			option.setName('비밀번호').setDescription('비밀번호').setRequired(true),
		),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../controller/Game')} game
	 */
	async execute(interaction, game) {
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
			logger.error(err);
			await interaction.reply({ content: `${err}`, ephemeral: true });
		}
	},
	/**
	 * @param {import('discord.js').SelectMenuInteraction} interaction
	 * @param {import('../controller/Game')} game
	 * @param {{ selectedList: string[] }} selectOptions
	 */
	async select(interaction, game, { selectedList }) {
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
							new ActionRowBuilder().addComponents(
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
			logger.error(err);
			await interaction.reply({ content: `${err}`, ephemeral: true });
		}
	},
	/**
	 * @param {import('discord.js').ModalSubmitInteraction} interaction
	 * @param {import('../controller/Game')} game
	 * @param {{ callFuncName: string }} options
	 */
	async modalSubmit(interaction, game, { callFuncName }) {
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
			logger.error(err);
			await interaction.reply({ content: `${err}`, ephemeral: true });
		}
	},
};
