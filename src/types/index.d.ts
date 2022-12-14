import { Resolver, AwilixContainer } from 'awilix';
import { Collection } from 'discord.js';

interface DependencyInjection extends DIFB.FilesDI {}

declare module 'discord.js' {
	export interface Client {
		commands: Collection<unknown, any>;
	}

	export interface BaseInteraction {
		customId?: string;
		commandName?: string;
	}
}

declare module 'awilix' {
	export interface AwilixContainer {
		cradle: DependencyInjection;
	}
}
