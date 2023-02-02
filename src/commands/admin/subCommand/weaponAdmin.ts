import {
	ActionRowBuilder,
	ModalSubmitInteraction,
	SelectMenuBuilder,
	SelectMenuInteraction,
} from 'discord.js';
import { getNewSelectMenu, getModal } from './common';
import weaponController from '../../../controller/bot/weaponController';
import { SwordConstructor } from '../../../game/Weapon/Sword';

type InputBoxInfo = {
	[id: string]: {
		label: string;
		style?: 'PARAGRAPH' | 'SHORT';
		value?: string;
	};
};

const showWeaponModal = async (
	interaction: SelectMenuInteraction,
	weaponType?: string,
) => {
	const modalInfo = {
		id: `어드민-${weaponType ? 'updateWeapon' : 'addWeapon'}`,
		title: '무기 추가/업데이트',
	};
	const inputBoxInfo: InputBoxInfo = {
		weaponType: { label: '무기종류(sword)' },
		powerMultipleAndMax: {
			label: '배율 (강화수 * 배율 = 힘)(기본1)/강화 맥스치==ratio길이',
		},
		cost: { label: '강화비용/지수함수 밑(기본1.2)' },
		ratioList: { label: '강화확률 리스트(실패,터짐/실패,터짐...)', style: 'PARAGRAPH' },
		comment: { label: '설명', style: 'PARAGRAPH' },
	};

	if (weaponType === 'sword') {
		const weapon = weaponController.getWeapon(weaponType);
		inputBoxInfo.weaponType.value = `${weapon.type}`;
		inputBoxInfo.powerMultipleAndMax.value = `${weapon.powerMultiple}/${weapon.maxPower}`;
		inputBoxInfo.cost.value = `${weapon.enhanceCost}/${weapon.baseMoney}`;
		inputBoxInfo.ratioList.value = `${weapon.ratioList
			.map(ratio => `${ratio.failRatio},${ratio.destroyRatio}`)
			.join('/')}`;
		inputBoxInfo.comment.value = `${weapon.comment}`;
	}

	const modal = getModal(modalInfo, inputBoxInfo);
	await interaction.showModal(modal);
};

const updateWeapon = async (interaction: ModalSubmitInteraction, isNew?: boolean) => {
	const weaponType = interaction.fields.getTextInputValue('weaponType');
	const [powerMultiple, maxPower] = interaction.fields
		.getTextInputValue('powerMultipleAndMax')
		.split('/')
		.map(Number);
	const [enhanceCost, baseMoney] = interaction.fields
		.getTextInputValue('cost')
		.split('/')
		.map(Number);
	const ratioList = interaction.fields
		.getTextInputValue('ratioList')
		.split('/')
		.map(ratio => {
			const [failRatio, destroyRatio] = ratio.split(',').map(Number);
			return { failRatio, destroyRatio };
		});
	const comment = interaction.fields.getTextInputValue('comment');

	if (ratioList.length !== maxPower) {
		throw Error(
			`maxPower(${maxPower})랑 ratioList(${ratioList.length})랑 길이가 맞지않음`,
		);
	}

	if (weaponType !== 'sword') {
		throw Error('무기타입이 잘못됨.');
	}

	let content = '';
	const defaultClassParam: SwordConstructor = {
		type: weaponType,
		powerMultiple,
		enhanceCost,
		baseMoney,
		maxPower,
		ratioList,
		comment,
	};

	await weaponController.updateWeapon(isNew ?? false, defaultClassParam);
	content = isNew ? '무기추가 완료' : '무기 업데이트 완료';

	await interaction.reply({
		content,
		components: [getNewSelectMenu()],
		ephemeral: true,
	});
};

const showWeaponList = async (interaction: SelectMenuInteraction) => {
	await interaction.reply({
		content: '어드민전용-업데이트할 무기',
		components: [
			new ActionRowBuilder<SelectMenuBuilder>().addComponents(
				new SelectMenuBuilder()
					.setCustomId('어드민')
					.setPlaceholder('무기 리스트')
					.addOptions(
						weaponController.getAllWeapon().map(weapon => ({
							label: weapon.type,
							value: `updateWeapon-${weapon.type}`,
							description: weapon.type,
						})),
					),
			),
		],
		ephemeral: true,
	});
};

export default {
	/** selectbox interaction function */
	select: {
		showWeaponModal,
		showWeaponList,
	},
	/** modal interaction function */
	modalSubmit: {
		updateWeapon,
	},
};
