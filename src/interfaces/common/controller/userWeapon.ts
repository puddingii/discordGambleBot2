import { TWeaponConstructor } from '../../game/weapon';
import { IUserService } from '../../services/userService';
import { IWeaponService } from '../../services/weaponService';

export interface IUserWeaponController {
	userService: IUserService;
	weaponService: IWeaponService;
	/** 무기종류 추가 */
	addWeaponAndUpdateUsers(param: TWeaponConstructor): Promise<void>;
}
