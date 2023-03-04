import { TWeaponConstructor } from '../../game/weapon';
import { IUserService } from '../services/userService';
import { IWeaponService } from '../services/weaponService';

export interface IUserWeaponController {
	userService: IUserService;
	weaponService: IWeaponService;
	/** 무기종류 추가 */
	addWeaponAndUpdateUsers(param: TWeaponConstructor): Promise<void>;
	/** 내 무기 강화에 필요한 정보 가져오기 */
	getMyWeaponEnhanceInfo(
		discordId: string,
		type: string,
	): Promise<{ success: number; fail: number; destroy: number; cost: number }>;
	/** 유저 무기강화 */
	enhanceWeapon(info: {
		discordId: string;
		type: string;
		isPreventDestroy: boolean;
		isPreventDown: boolean;
	}): Promise<{ code: 1 | 2 | 3; curPower: number; beforePower: number }>;
}
