export interface ILogger {
	error(error: unknown, depthList: Array<string>): void;
	info(message: string, depthList: Array<string>): void;
	warn(message: string, depthList: Array<string>): void;
}
