import { ModalSubmitInteraction, SelectMenuInteraction } from 'discord.js';
import { getNewSelectMenu, getModal } from './common';
import Game from '../../controller/Game';

const showGameStatusModal = async (interaction: SelectMenuInteraction, game: Game) => {
	const modalInfo = {
		id: '어드민-updateStatus',
		title: '게임상태 업데이트',
	};
	const inputBoxInfo = {
		curCondition: {
			label: '현재 컨디션(0-평범,1-최악,2-악,3-호,4-최호)',
			value: `${game.gamble.curCondition}`,
		},
		conditionPeriod: {
			label: '컨디션 바뀌는 주기(30분*n)',
			value: `${game.gamble.conditionPeriod}`,
		},
		conditionRatioPerList: {
			label: '컨디션이 바뀔 확률(씹악/악/호/씹호)',
			value: game.gamble.conditionRatioPerList.join('/'),
		},
	};

	const modal = getModal(modalInfo, inputBoxInfo);
	await interaction.showModal(modal);
};

const updateStatus = async (interaction: ModalSubmitInteraction, game: Game) => {
	const curCondition = Number(interaction.fields.getTextInputValue('curCondition'));
	const conditionRatioPerList = interaction.fields
		.getTextInputValue('conditionRatioPerList')
		.split('/')
		.map(Number);
	const conditionPeriod = Number(interaction.fields.getTextInputValue('conditionPeriod'));

	if (
		(curCondition !== 0 && !curCondition) ||
		!conditionRatioPerList ||
		!conditionPeriod
	) {
		await interaction.reply({
			content: '제대로 입력해라',
			components: [getNewSelectMenu()],
			ephemeral: true,
		});
		return;
	}

	game.gamble.curCondition = curCondition;
	game.gamble.conditionRatioPerList = conditionRatioPerList;
	game.gamble.conditionPeriod = conditionPeriod;

	await interaction.reply({
		content: '업데이트 완료',
		components: [getNewSelectMenu()],
		ephemeral: true,
	});
};

export default {
	select: {
		showGameStatusModal,
	},
	modalSubmit: {
		updateStatus,
	},
};
