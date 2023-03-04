import { inject, injectable } from 'inversify';
import TYPES from '../../interfaces/containerType';
import { IWeapon, TWeaponConstructor } from '../../interfaces/game/weapon';
import { IWeaponController } from '../../interfaces/common/controller/weapon';

@injectable()
export default class WeaponController implements IWeaponController {
	weaponService: IWeaponController['weaponService'];

	constructor(
		@inject(TYPES.WeaponService) weaponService: IWeaponController['weaponService'],
	) {
		this.weaponService = weaponService;
	}

	async getAllWeapon(): Promise<IWeapon[]> {
		const weaponList = await this.weaponService.getAllWeapon();

		return weaponList;
	}

	async getEnhanceInfo(
		type: string,
		power: number,
	): Promise<{ success: number; fail: number; destroy: number; cost: number }> {
		const weapon = await this.weaponService.getWeapon(type);

		return this.weaponService.getEnhanceInfo(weapon, power);
	}

	async getEnhanceInfoList(
		type: string,
	): Promise<{ success: number; fail: number; destroy: number; cost: number }[]> {
		const weapon = await this.weaponService.getWeapon(type);

		return weapon.ratioList.map((_, idx) =>
			this.weaponService.getEnhanceInfo(weapon, idx),
		);
	}

	async getWeapon(type: string): Promise<IWeapon> {
		const weapon = await this.weaponService.getWeapon(type);

		return weapon;
	}

	async updateWeapon(param: TWeaponConstructor): Promise<void> {
		const weapon = await this.weaponService.getWeapon(param.type);

		await this.weaponService.updateWeapon(weapon, param);
	}
}
