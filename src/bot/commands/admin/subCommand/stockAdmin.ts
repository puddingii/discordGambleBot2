import {
	ActionRowBuilder,
	ModalSubmitInteraction,
	SelectMenuBuilder,
	SelectMenuInteraction,
} from 'discord.js';
import { getNewSelectMenu, getModal } from './common';
import Stock from '../../../../game/Stock/Stock';
import stockController from '../../../../controller/stockController';
import secretKey from '../../../../config/secretKey';
import {
	TValidCoinParam,
	TValidStockParam,
} from '../../../../interfaces/services/stockService';

type InputBoxInfo = {
	[id: string]: {
		label: string;
		style?: 'PARAGRAPH' | 'SHORT';
		value?: string;
	};
};

const showStockModal = async (interaction: SelectMenuInteraction, stockName?: string) => {
	const modalInfo = {
		id: `어드민-${stockName ? 'updateStock' : 'addStock'}`,
		title: '주식 추가/업데이트',
	};
	const inputBoxInfo: InputBoxInfo = {
		nameType: { label: '주식이름/종류 (업데이트는 이름과 종류를 바꿀 수 없음)' },
		value: { label: '1주당 가격' },
		ratio: { label: '최소/최대/배당퍼센트/조정주기(n*30분)' },
		conditionList: { label: '컨디션 - 아무일도없음/씹악재/악재/호재/씹호재' },
		comment: { label: '설명', style: 'PARAGRAPH' },
	};

	if (stockName) {
		const stock = await stockController.getStock(stockName);
		inputBoxInfo.nameType.value = `${stock.name}/${stock.type}`;
		inputBoxInfo.value.value = `${stock.value}`;
		const { min, max } = stock.getRatio();
		inputBoxInfo.comment.value = `${stock.comment}`;
		if (stock instanceof Stock) {
			inputBoxInfo.ratio.value = `${min}/${max}/${stock.dividend}/${stock.correctionCnt}`;
			inputBoxInfo.conditionList.value = `${stock?.conditionList.join('/')}`;
		}
	}

	const modal = getModal(modalInfo, inputBoxInfo);
	await interaction.showModal(modal);
};

const updateStock = async (interaction: ModalSubmitInteraction, isNew?: boolean) => {
	const [name, type] = interaction.fields.getTextInputValue('nameType').split('/');
	const value = Number(interaction.fields.getTextInputValue('value'));
	const [minRatio, maxRatio, dividend, correctionCnt] = interaction.fields
		.getTextInputValue('ratio')
		.split('/')
		.map(Number);
	const conditionList = interaction.fields
		.getTextInputValue('conditionList')
		.split('/')
		.map(Number);
	const comment = interaction.fields.getTextInputValue('comment');

	const param = {
		name,
		type,
		value,
		comment,
		minRatio,
		maxRatio,
		correctionCnt,
		conditionList,
		dividend,
	};

	if (!['coin', 'stock'].includes(param.type)) {
		throw Error('type을 잘못 입력함');
	}

	let content = '';
	const defaultClassParam = {
		name: param.name,
		value: param.value,
		comment: param.comment,
		ratio: { min: param.minRatio, max: param.maxRatio },
		correctionCnt: param.correctionCnt,
		updateTime: secretKey.stockUpdateTime,
	};
	const stockParam: TValidStockParam = {
		conditionList: param.conditionList,
		dividend: param.dividend,
		...defaultClassParam,
		type: 'stock',
	};
	const coinParam: TValidCoinParam = {
		...defaultClassParam,
		type: 'coin',
	};

	if (type === 'stock' && !isNew) {
		await stockController.updateStock(stockParam);
	} else if (type === 'stock' && isNew) {
		await stockController.addStock(stockParam);
	} else if (type === 'coin' && !isNew) {
		await stockController.updateStock(coinParam);
	} else {
		await stockController.addCoin(coinParam);
	}

	content = isNew ? '주식추가 완료' : '주식 업데이트 완료';

	await interaction.reply({
		content,
		components: [getNewSelectMenu()],
		ephemeral: true,
	});
};

const showStockList = async (interaction: SelectMenuInteraction) => {
	await interaction.reply({
		content: '어드민전용-업데이트할 주식',
		components: [
			new ActionRowBuilder<SelectMenuBuilder>().addComponents(
				new SelectMenuBuilder()
					.setCustomId('어드민')
					.setPlaceholder('주식 리스트')
					.addOptions(
						(
							await stockController.getAllStock()
						).map(stock => ({
							label: stock.name,
							value: `updateStock-${stock.name}`,
							description: stock.type,
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
		showStockModal,
		showStockList,
	},
	/** modal interaction function */
	modalSubmit: {
		updateStock,
	},
};
