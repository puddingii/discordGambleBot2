import ToolAbstract, { ToolConstructor } from './ToolAbstract';

type SwordInfo = {
	bonusPower: number;
	hitRatio: number;
	missRatio: number;
};

type SwordConstructor = Partial<SwordInfo> & Omit<ToolConstructor, 'type'>;

export default class Sword extends ToolAbstract {
	private _hitRatio: SwordInfo['hitRatio'];
	private _missRatio: SwordInfo['missRatio'];
	bonusPower: SwordInfo['bonusPower'];

	constructor(weaponInfo?: SwordConstructor) {
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
