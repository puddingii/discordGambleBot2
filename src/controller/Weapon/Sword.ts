import ToolAbstract, { ToolConstructor } from './ToolAbstract';

interface SwordConstructor extends ToolConstructor {
	bonusPower: number;
	hitRatio: number;
	missRatio: number;
}

export default class Sword extends ToolAbstract {
	#hitRatio: number;
	#missRatio: number;
	bonusPower: number;

	constructor(weaponInfo: SwordConstructor) {
		super({ ...weaponInfo, type: 'sword' });
		this.bonusPower = weaponInfo?.bonusPower ?? 0;
		this.#hitRatio = weaponInfo?.hitRatio ?? 1;
		this.#missRatio = weaponInfo?.missRatio ?? 0;
	}

	getHitRatio(): number {
		return this.#hitRatio;
	}

	getMissRatio(): number {
		return this.#missRatio;
	}
}
