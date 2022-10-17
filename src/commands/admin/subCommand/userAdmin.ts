import { ModalSubmitInteraction, SelectMenuInteraction } from 'discord.js';
import dependency from '../../../config/dependencyInjection';
import userController from '../../../controller/bot/userController';
import { getNewSelectMenu, getModal } from './common';

const {
	cradle: {
		util: { setComma },
	},
} = dependency;

export default {
	select: {
		async showGiveMoneyModal(interaction: SelectMenuInteraction) {
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
		async giveMoney(interaction: ModalSubmitInteraction) {
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

			const userInfo = userController.getUser({ nickname });
			if (!userInfo) {
				await interaction.reply({
					content: '유저정보가 없습니다.',
					components: [getNewSelectMenu()],
					ephemeral: true,
				});
				return;
			}

			userInfo.updateMoney(cnt);

			await interaction.reply({
				content: `${nickname}에게 ${setComma(cnt)}원을 줬습니다`,
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
		},
	},
};
