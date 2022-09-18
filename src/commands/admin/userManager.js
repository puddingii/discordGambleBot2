const {
	cradle: { UserModel },
} = require('../../config/dependencyInjection');
const { setComma } = require('../../config/util');
const { getNewSelectMenu, getModal } = require('./common');

module.exports = {
	select: {
		/**
		 * @param {import('discord.js').SelectMenuInteraction} interaction
		 */
		async showGiveMoneyModal(interaction) {
			const modalInfo = {
				id: '어드민-giveMoney',
				title: '유저에게 돈주기',
			};
			const inputBoxInfo = {
				userNick: { label: '유저 닉네임' },
				cnt: { label: '돈의 양' },
			};

			const modal = getModal(modalInfo, inputBoxInfo);
			await interaction.showModal(modal);
		},
	},
	modalSubmit: {
		/**
		 * @param {import('discord.js').ModalSubmitInteraction} interaction
		 * @param {import('../../controller/Game')} game
		 */
		async giveMoney(interaction, game) {
			const nickname = interaction.fields.getTextInputValue('userNick');
			const cnt = Number(interaction.fields.getTextInputValue('cnt'));

			if (!nickname || !cnt) {
				await interaction.reply({
					content: '닉네임, 금액을 제대로 적어주세요',
					components: [getNewSelectMenu()],
					ephemeral: true,
				});
				return;
			}

			const userInfo = game.getUser({ nickname });
			if (!userInfo) {
				await interaction.reply({
					content: '유저정보가 없습니다.',
					components: [getNewSelectMenu()],
					ephemeral: true,
				});
				return;
			}

			const gameResult = userInfo.updateMoney(cnt);
			if (!gameResult.code) {
				await interaction.reply({
					content: gameResult.message,
					components: [getNewSelectMenu()],
					ephemeral: true,
				});
				return;
			}

			await UserModel.updateMoney([userInfo]);

			await interaction.reply({
				content: `${nickname}에게 ${setComma(cnt)}원을 줬습니다`,
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
		},
	},
};
