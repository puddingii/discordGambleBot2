const ToolAbstract = require('./ToolAbstract');

module.exports = class Sword extends ToolAbstract {
	#hitRatio;
	#missRatio;

	/**
	 * @param {import('./ToolAbstract').WeaponInfo & { bonusPower: number, hitRatio: number, missRatio: number}} weaponInfo
	 */
	constructor(weaponInfo) {
		super({ ...weaponInfo, type: 'sword' });
		this.bonusPower = weaponInfo?.bonusPower ?? 0;
		this.#hitRatio = weaponInfo?.hitRatio ?? 1;
		this.#missRatio = weaponInfo?.missRatio ?? 0;
	}

	getHitRatio() {
		return this.#hitRatio;
	}

	getMissRatio() {
		return this.#missRatio;
	}
};
