import schedule from 'node-schedule';
import dayjs from 'dayjs';
import stockController from '../common/controller/stockController';
import secretKey from '../config/secretKey';
import { container } from '../settings/container';
import TYPES from '../interfaces/containerType';
import { IUtil } from '../common/util/util';
import { IStatusController } from '../interfaces/common/controller/status';

const util = container.get<IUtil>(TYPES.Util);
const statusController = container.get<IStatusController>(TYPES.StatusController);
try {
	const { type, value } = util.formatter.convertSecond(secretKey.gambleUpdateTime);
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
			/** 12시간마다 컨디션 조정 */
			await stockController.updateCondition();
			await statusController.updateCurTime(1);
			await statusController.updateGrantMoney();

			await stockController.updateStockRandom();
			await stockController.giveDividend();

			util.logger.info(`${dayjs(cronTime).format('YYYY.MM.DD')} - Stock Update`, [
				'CRON',
			]);
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			util.logger.error(
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
	util.logger.error(`UpdateStock: ${errorMessage}`, ['CRON']);
}
