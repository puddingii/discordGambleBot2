import ToolAbstract, { ToolConstructor } from './ToolAbstract';

interface SwordConstructor extends ToolConstructor {
	bonusPower: number;
	hitRatio: number;
	missRatio: number;
}

export default class Sword extends ToolAbstract {
	private _hitRatio: number;
	private _missRatio: number;
	bonusPower: number;

	constructor(weaponInfo: SwordConstructor) {
		super({ ...weaponInfo, type: 'sword' });
		this.bonusPower = weaponInfo?.bonusPower ?? 0;
		this._hitRatio = weaponInfo?.hitRatio ?? 1;
		this._missRatio = weaponInfo?.missRatio ?? 0;
	}

	get hitRatio(): number {
		return this._hitRatio;
	}

	get missRatio(): number {
		return this._missRatio;
	}
}
