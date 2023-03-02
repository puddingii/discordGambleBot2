import { inject, injectable } from 'inversify';
import { IUserWeaponController } from '../../interfaces/common/controller/userWeapon';
import { TWeaponConstructor } from '../../interfaces/game/weapon';
import TYPES from '../../interfaces/containerType';

@injectable()
export default class UserWeaponController implements IUserWeaponController {
	userService: IUserWeaponController['userService'];
	weaponService: IUserWeaponController['weaponService'];

	constructor(
		@inject(TYPES.UserService) userService: IUserWeaponController['userService'],
		@inject(TYPES.WeaponService) weaponService: IUserWeaponController['weaponService'],
	) {
		this.userService = userService;
		this.weaponService = weaponService;
	}
	async addWeaponAndUpdateUsers(param: TWeaponConstructor): Promise<void> {
		const weapon = await this.weaponService.addWeapon(param);
		await this.userService.addWeapon(weapon);
	}
}
