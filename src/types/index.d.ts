import { Collection } from 'discord.js';
import { Express } from 'express-serve-static-core';
import { IUserInfo } from '../common/model/User';

// interface DependencyInjection extends DIFB.FilesDI {}

declare module 'discord.js' {
	export interface Client {
		commands: Collection<unknown, any>;
	}

	export interface BaseInteraction {
		customId?: string;
		commandName?: string;
	}
}

// declare module 'awilix' {
// 	export interface AwilixContainer {
// 		cradle: DependencyInjection;
// 	}
// }
declare module 'express-serve-static-core' {
	interface Request {
		user?: IUserInfo;
	}
}
