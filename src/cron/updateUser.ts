import schedule from 'node-schedule';
import dayjs from 'dayjs';
import DataManager from '../game/DataManager';
import dependencyInjection from '../config/dependencyInjection';

const {
	cradle: {
		UserModel,
		secretKey,
		logger,
		util: { convertSecond },
	},
} = dependencyInjection;

try {
	const dataManager = DataManager.getInstance();
	const { type, value } = convertSecond(secretKey.userUpdateTime);
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
	schedule.scheduleJob(rule, function (cronTime) {
		try {
			const userManager = dataManager.get('user');
			const userList = userManager.popAllWaitingList();
			userList.length && UserModel.updateAll(userList);
			logger.info(`[CRON] ${dayjs(cronTime).format('YYYY.MM.DD')} - User Update`);
		} catch (err) {
			let errorMessage = err;
			if (err instanceof Error) {
				errorMessage = err.message;
			}
			logger.error(
				`[CRON] ${dayjs(cronTime).format(
					'YYYY.MM.DD',
				)} - User Update Error: ${errorMessage}`,
			);
		}
	});
} catch (err) {
	let errorMessage = err;
	if (err instanceof Error) {
		errorMessage = err.message;
	}
	logger.error(`[CRON] UpdateUser: ${errorMessage}`);
}
