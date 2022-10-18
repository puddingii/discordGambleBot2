import schedule from 'node-schedule';
import dayjs from 'dayjs';
import DataManager from '../game/DataManager';
import stockController from '../controller/bot/stockController';
import dependencyInjection from '../config/dependencyInjection';

const {
	cradle: { UserModel, StockModel, secretKey, logger },
} = dependencyInjection;

/** 시간 분석해주는 유틸 필요해보임.  */
schedule.scheduleJob(`*/${secretKey.gambleUpdateTime} * * * * *`, function (cronTime) {
	try {
		const dataManager = DataManager.getInstance();
		/** 12시간마다 컨디션 조정 */
		const globalManager = dataManager.get('globalStatus');
		const stockManager = dataManager.get('stock');
		stockManager.updateCondition(globalManager.curTime);
		globalManager.curTime++;
		globalManager.updateGrantMoney();
		const { stockList, userList } = stockController.update(globalManager.curTime);
		stockList.length && StockModel.updateStockList(stockList);
		userList.length && UserModel.updateMoney(userList);
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
