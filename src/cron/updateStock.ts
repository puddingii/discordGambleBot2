import schedule from 'node-schedule';
import dayjs from 'dayjs';
import DataManager from '../game/DataManager';
import stockController from '../controller/bot/stockController';
import dependencyInjection from '../config/dependencyInjection';

const {
	cradle: {
		StockModel,
		StatusModel,
		secretKey,
		logger,
		util: { convertSecond },
	},
} = dependencyInjection;

try {
	const { type, value } = convertSecond(secretKey.gambleUpdateTime);
	const defaultRule = '* * *';
	let rule: string;
	switch (type) {
		case 's':
			rule = `*/${value} * * ${defaultRule}`;
			break;
		case 'm':
			rule = `*/${value} * ${defaultRule}`;
			break;
		case 'h':
			rule = `* */${value} ${defaultRule}`;
			break;
		default:
			throw Error('Rule설정 에러.');
	}

	/** 시간 분석해주는 유틸 필요해보임.  */
	schedule.scheduleJob(rule, async function (cronTime) {
		try {
			const dataManager = DataManager.getInstance();
			/** 12시간마다 컨디션 조정 */
			const globalManager = dataManager.get('globalStatus');
			const stockManager = dataManager.get('stock');
			stockManager.updateCondition(globalManager.curTime);
			globalManager.curTime++;
			globalManager.updateGrantMoney();

			const stockList = stockController.update(globalManager.curTime);
			stockList.length && (await StockModel.updateStockList(stockList));
			await StatusModel.updateStatus({
				gamble: { curTime: globalManager.curTime },
				user: { grantMoney: globalManager.grantMoney },
			});
			logger.info(`[CRON] ${dayjs(cronTime).format('YYYY.MM.DD')} - Stock Update`);
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(
				`[CRON] ${dayjs(cronTime).format(
					'YYYY.MM.DD',
				)} - Stock Update Error: ${errorMessage}`,
			);
		}
	});
} catch (err) {
	let errorMessage = err;
	if (err instanceof Error) {
		errorMessage = err.message;
	}
	logger.error(`[CRON] UpdateStock: ${errorMessage}`);
}
