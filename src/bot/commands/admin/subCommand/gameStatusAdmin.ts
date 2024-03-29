import { ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js';
import { getNewSelectMenu, getModal } from './common';
import TYPES from '../../../../interfaces/containerType';
import { container } from '../../../../settings/container';
import { IStatusController } from '../../../../interfaces/common/controller/status';

const statusController = container.get<IStatusController>(TYPES.StatusController);

const showGameStatusModal = async (interaction: StringSelectMenuInteraction) => {
	const { curCondition, conditionPeriod, conditionRatioPerList } =
		await statusController.getGambleStatus();
	const modalInfo = {
		id: '어드민-updateStatus',
		title: '주식상태 업데이트',
	};
	const inputBoxInfo = {
		curCondition: {
			label: '현재 컨디션(0-평범,1-최악,2-악,3-호,4-최호)',
			value: `${curCondition}`,
		},
		conditionPeriod: {
			label: '컨디션 바뀌는 주기(30분*n)',
			value: `${conditionPeriod}`,
		},
		conditionRatioPerList: {
			label: '컨디션이 바뀔 확률(씹악/악/호/씹호) (단위: %)',
			value: conditionRatioPerList.join('/'),
		},
	};

	const modal = getModal(modalInfo, inputBoxInfo);
	await interaction.showModal(modal);
};

const updateStatus = async (interaction: ModalSubmitInteraction) => {
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
		throw Error('제대로 입력해라');
	}

	await statusController.setGambleStatus({
		curCondition,
		conditionRatioPerList,
		conditionPeriod,
	});

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
