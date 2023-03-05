import {
	ButtonInteraction,
	ChatInputCommandInteraction,
	Collection,
	ModalSubmitInteraction,
	SelectMenuInteraction,
} from 'discord.js';
import { Express } from 'express-serve-static-core';
import { IUserInfo } from '../common/model/User';

// interface DependencyInjection extends DIFB.FilesDI {}
type TCustomName = string;
type TCustomId = string;

type TCommandEvent = {
	select(interaction: SelectMenuInteraction): Promise<void>;
	modalSubmit(interaction: ModalSubmitInteraction): Promise<void>;
	buttonClick(interaction: ButtonInteraction): Promise<void>;
	execute(interaction: ChatInputCommandInteraction): Promise<void>;
};

declare module 'discord.js' {
	export interface Client {
		commands: Collection<TCustomName, TCommandEvent>;
	}

	export interface BaseInteraction {
		customId?: TCustomId;
		commandName?: TCustomId;
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
