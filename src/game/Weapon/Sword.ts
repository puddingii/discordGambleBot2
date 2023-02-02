import ToolAbstract, { ToolConstructor } from './ToolAbstract';

export type SwordConstructor = ToolConstructor;

export default class Sword extends ToolAbstract {
	constructor(weaponInfo: SwordConstructor) {
		super({ ...weaponInfo, type: 'sword' });
	}
}
