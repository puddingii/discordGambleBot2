import schedule from 'node-schedule';
import dayjs from 'dayjs';
import DataManager from '../game/DataManager';
import stockController from '../controller/bot/stockController';
import statusController from '../controller/bot/statusController';
import dependencyInjection from '../config/dependencyInjection';

const {
	cradle: {
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
			await stockController.updateCondition(globalManager.curTime);
			await statusController.updateCurTime(1);
			await statusController.updateGrantMoney();

			await stockController.updateStockRandom(globalManager.curTime);
			await stockController.giveDividend(globalManager.curTime);

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
