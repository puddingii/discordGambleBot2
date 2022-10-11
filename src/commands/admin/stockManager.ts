import { ModalSubmitInteraction, SelectMenuInteraction } from 'discord.js';
import dependency from '../../config/dependencyInjection';
import { getNewSelectMenu, getModal } from './common';
import Stock from '../../controller/Gamble/Stock';
import Coin from '../../controller/Gamble/Coin';
import Game from '../../controller/Game';

const {
	cradle: { StockModel, secretKey },
} = dependency;

type InputBoxInfo = {
	[id: string]: {
		label: string;
		style?: 'PARAGRAPH' | 'SHORT';
		value?: string;
	};
};

interface DefaultStockParam {
	name: string;
	type: 'stock' | 'coin';
	value: number;
	comment: string;
	ratio: { min: number; max: number };
	correctionCnt: number;
	updateTime: number;
}

interface StockParam extends DefaultStockParam {
	type: 'stock';
	conditionList: Array<number>;
	dividend: number;
}

interface CoinParam extends DefaultStockParam {
	type: 'coin';
}

const showStockModal = async (
	interaction: SelectMenuInteraction,
	game?: Game,
	stockName?: string,
) => {
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

	if (game && stockName) {
		// FIXME
		const stock = <Stock>game.gamble.getStock('stock', stockName);
		if (stock) {
			inputBoxInfo.nameType.value = `${stock.name}/${stock.type}`;
			inputBoxInfo.value.value = `${stock.value}`;
			const { min, max } = stock.getRatio();
			inputBoxInfo.ratio.value = `${min}/${max}/${stock.dividend}/${stock.correctionCnt}`;
			inputBoxInfo.conditionList.value = `${stock?.conditionList.join('/')}`;
			inputBoxInfo.comment.value = `${stock.comment}`;
		}
	}

	const modal = getModal(modalInfo, inputBoxInfo);
	await interaction.showModal(modal);
};

const updateStock = async (
	interaction: ModalSubmitInteraction,
	game: Game,
	isNew?: boolean,
) => {
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
		await interaction.reply({
			content: 'type을 잘못 입력함',
			components: [getNewSelectMenu()],
			ephemeral: true,
		});
		return;
	}
	const { code, message } =
		type === 'stock'
			? Stock.checkStockValidation(<Omit<typeof param, 'type'> & { type: 'stock' }>param)
			: Coin.checkStockValidation(<Omit<typeof param, 'type'> & { type: 'coin' }>param);
	if (!code) {
		await interaction.reply({
			content: message,
			components: [getNewSelectMenu()],
			ephemeral: true,
		});
		return;
	}
	/** DB Info */
	let content = '';
	const defaultClassParam = {
		name: param.name,
		value: param.value,
		comment: param.comment,
		ratio: { min: param.minRatio, max: param.maxRatio },
		correctionCnt: param.correctionCnt,
		updateTime: secretKey.stockUpdateTime,
	};
	const stockParam: StockParam = {
		conditionList: param.conditionList,
		dividend: param.dividend,
		...defaultClassParam,
		type: 'stock',
	};
	const coinParam: CoinParam = {
		...defaultClassParam,
		type: 'coin',
	};

	// 새 주식인 경우
	if (isNew) {
		const stock = type === 'stock' ? new Stock(stockParam) : new Coin(coinParam);
		game.gamble.addStock(stock);

		const dbResult = await StockModel.addStock(stock);
		content = dbResult.code ? '주식추가 완료' : <string>dbResult.message;
	}
	// 기존 주식 업데이트인 경우
	else {
		const stock = game.gamble.getStock(<'stock' | 'coin'>type, name);
		if (!stock) {
			await interaction.reply({
				content: `해당하는 이름의 ${type === 'stock' ? '주식' : '코인'}이 없습니다.`,
				components: [getNewSelectMenu()],
				ephemeral: true,
			});
			return;
		}
		stock.comment = param.comment;
		stock.value = param.value;
		stock.setRatio({ min: param.minRatio, max: param.maxRatio });
		stock.correctionCnt = param.correctionCnt;
		if (stock instanceof Stock) {
			stock.conditionList = param.conditionList;
			stock.dividend = param.dividend;
		}

		const dbResult = await StockModel.updateStock(param);
		content = dbResult.code ? '주식 업데이트 완료' : <string>dbResult.message;
	}

	await interaction.reply({
		content,
		components: [getNewSelectMenu()],
		ephemeral: true,
	});
};

export default {
	/** selectbox interaction function */
	select: {
		showStockModal,
	},
	/** modal interaction function */
	modalSubmit: {
		updateStock,
	},
};
