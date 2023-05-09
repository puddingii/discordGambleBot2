import { IFormatter } from './formatter';
import { ILogger } from './logger';

export interface IUtil {
	logger: ILogger;
	formatter: IFormatter;

	getErrorMessage(err: unknown, defaultMessage?: string): string;
}
