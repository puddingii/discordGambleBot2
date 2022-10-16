import {
	ActionRowBuilder,
	SelectMenuBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	ModalActionRowComponentBuilder,
} from 'discord.js';

type GetModalParam = {
	[id: string]: {
		id?: string;
		label: string;
		style?: 'SHORT' | 'PARAGRAPH';
		value?: string;
	};
};

export const getNewSelectMenu = () => {
	return new ActionRowBuilder<SelectMenuBuilder>().addComponents(
		new SelectMenuBuilder()
			.setCustomId('어드민-main')
			.setPlaceholder('Nothing selected')
			.addOptions([
				{
					label: '주식추가',
					description: '주식추가',
					value: 'showAddStockModal',
				},
				{
					label: '주식정보업데이트',
					description: '주식정보 강제 업데이트',
					value: 'selectStock',
				},
				{
					label: '게임상태업데이트',
					description: '게임상태 강제 업데이트',
					value: 'showGameStatusModal',
				},
				{
					label: '돈기부',
					description: '돈 주는 기능',
					value: 'showGiveMoneyModal',
				},
			]),
	);
};

/** 모달객체 생성 */
export const getModal = (
	modalInfo: { id: string; title: string },
	inputBoxInfo: GetModalParam,
) => {
	const inputBoxList = Object.keys(inputBoxInfo).map(key => ({
		...inputBoxInfo[key],
		id: key,
	}));

	const modal = new ModalBuilder().setCustomId(modalInfo.id).setTitle(modalInfo.title);

	const actionRows = inputBoxList.map(inputBox => {
		return new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			new TextInputBuilder()
				.setCustomId(inputBox.id)
				.setLabel(inputBox.label)
				.setStyle(
					inputBox.style === 'PARAGRAPH'
						? TextInputStyle.Paragraph
						: TextInputStyle.Short,
				)
				.setValue(inputBox.value ?? ''),
		);
	});

	modal.addComponents(...actionRows);
	return modal;
};

export default {
	getNewSelectMenu,
	getModal,
};
