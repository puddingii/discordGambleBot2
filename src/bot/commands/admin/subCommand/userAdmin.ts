import { ModalSubmitInteraction, SelectMenuInteraction } from 'discord.js';
import { setComma } from '../../../../config/util';
import userController from '../../../../controller/userController';
import { getNewSelectMenu, getModal } from './common';

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
				throw Error('닉네임, 금액을 제대로 적어주세요');
			}

			await userController.adjustMoney({ nickname }, cnt);

			await interaction.reply({
				content: `${nickname}에게 ${setComma(cnt)}원을 줬습니다`,
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
		},
	},
};
