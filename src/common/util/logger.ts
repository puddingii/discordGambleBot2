import winston from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';
import path from 'path';
import { injectable } from 'inversify';
import envInfo from '../../config/secretKey';

export interface ILogger {
	error(error: unknown, depthList: Array<string>): void;
	info(message: string, depthList: Array<string>): void;
	warn(message: string, depthList: Array<string>): void;
}

@injectable()
class Logger implements ILogger {
	/*
	 * Log Level
	 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
	 */
	private logger: winston.Logger;
	constructor() {
		const { combine, timestamp, colorize, simple } = winston.format;
		const logDir = path.resolve(__dirname, '../../../log'); // logs 디렉토리 하위에 로그 파일 저장
		this.logger = winston.createLogger({
			format: combine(
				timestamp({
					format: 'YYYY-MM-DD HH:mm:ss',
				}),
				this.getLogFormat(),
			),
			transports: [
				// info 레벨 로그를 저장할 파일 설정
				new WinstonDaily({
					level: 'info',
					datePattern: 'YYYY-MM-DD',
					dirname: logDir,
					filename: `%DATE%.log`,
					maxFiles: 30, // 30일치 로그 파일 저장
					zippedArchive: true,
				}),
				// error 레벨 로그를 저장할 파일 설정
				new WinstonDaily({
					level: 'error',
					datePattern: 'YYYY-MM-DD',
					dirname: logDir,
					filename: `%DATE%.error.log`,
					maxFiles: 30,
					zippedArchive: true,
				}),
			],
		});

		// Production 환경이 아닌 경우(dev 등)
		if (envInfo.nodeEnv === 'development') {
			this.logger.add(
				new winston.transports.Console({
					format: winston.format.combine(colorize(), simple()),
				}),
			);
		}
	}

	private combineDepth(list: Array<string>) {
		return list.map(depth => `[${depth}]`).join(' ');
	}

	error(error: unknown, depthList: Array<string>) {
		const depthStr = this.combineDepth(depthList);
		let message = error;
		if (error instanceof Error) {
			message = error.message;
		}
		this.logger.error(`${depthStr} ${message}`);
	}

	private getLogFormat() {
		const { printf } = winston.format;
		return printf(info => {
			return `${info.timestamp} ${info.level}: ${info.message}`;
		});
	}

	info(message: string, depthList: Array<string>) {
		const depthStr = this.combineDepth(depthList);
		this.logger.info(`${depthStr} ${message}`);
	}

	warn(message: string, depthList: Array<string>) {
		const depthStr = this.combineDepth(depthList);
		this.logger.warn(`${depthStr} ${message}`);
	}
}

export default Logger;
