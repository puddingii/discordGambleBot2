import schedule from 'node-schedule';
import dayjs from 'dayjs';
import DataManager from '../game/DataManager';
import stockController from '../controller/bot/stockController';
import statusController from '../controller/bot/statusController';
import secretKey from '../config/secretKey';
import { convertSecond } from '../config/util';
import { container } from '../settings/container';
import TYPES from '../interfaces/containerType';
import { ILogger } from '../util/logger';

const logger = container.get<ILogger>(TYPES.Logger);
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
			const { curTime } = globalManager;
			await stockController.updateCondition();
			await statusController.updateCurTime(curTime + 1);
			await statusController.updateGrantMoney();

			await stockController.updateStockRandom();
			await stockController.giveDividend();

			logger.info(`${dayjs(cronTime).format('YYYY.MM.DD')} - Stock Update`, ['CRON']);
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(
				`${dayjs(cronTime).format('YYYY.MM.DD')} - Stock Update Error: ${errorMessage}`,
				['CRON'],
			);
		}
	});
} catch (err) {
	let errorMessage = err;
	if (err instanceof Error) {
		errorMessage = err.message;
	}
	logger.error(`UpdateStock: ${errorMessage}`, ['CRON']);
}
