import { ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js';
import { getNewSelectMenu, getModal } from './common';
import { container } from '../../../../settings/container';
import TYPES from '../../../../interfaces/containerType';
import { IFormatter } from '../../../../common/util/formatter';
import { IUserController } from '../../../../interfaces/common/controller/user';

const formatter = container.get<IFormatter>(TYPES.Formatter);
const userController = container.get<IUserController>(TYPES.UserController);

export default {
	select: {
		async showGiveMoneyModal(interaction: StringSelectMenuInteraction) {
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

			await userController.updateMoney({ nickname }, cnt);

			await interaction.reply({
				content: `${nickname}에게 ${formatter.setComma(cnt)}원을 줬습니다`,
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
		},
	},
};
