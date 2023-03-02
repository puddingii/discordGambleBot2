import { container } from '../../settings/container';
import TYPES from '../../interfaces/containerType';
import { TWeaponConstructor } from '../../interfaces/game/weapon';
import { IWeaponService } from '../../interfaces/services/weaponService';
import { IUserService } from '../../interfaces/services/userService';

/** 무기종류 추가 */
export const addWeapon = async (param: TWeaponConstructor) => {
	const weaponService = container.get<IWeaponService>(TYPES.WeaponService);
	const userService = container.get<IUserService>(TYPES.UserService);
	const weapon = await weaponService.addWeapon(param);
	await userService.addWeapon(weapon);
};

/** 무기 가져오기 */
export const getWeapon = async (type: string) => {
	const weaponService = container.get<IWeaponService>(TYPES.WeaponService);
	const weapon = await weaponService.getWeapon(type);

	return weapon;
};

/** 무기 업데이트 */
export const updateWeapon = async (param: TWeaponConstructor) => {
	const weaponService = container.get<IWeaponService>(TYPES.WeaponService);
	const weapon = await weaponService.getWeapon(param.type);

	await weaponService.updateWeapon(weapon, param);
};

/** 모든 무기 다 가져오기 */
export const getAllWeapon = async () => {
	const weaponService = container.get<IWeaponService>(TYPES.WeaponService);
	const weaponList = await weaponService.getAllWeapon();

	return weaponList;
};

/** 현재 상태의 무기를 강화하는데 필요한 정보 가져오기 */
export const getEnhanceInfo = async (type: string, power: number) => {
	const weaponService = container.get<IWeaponService>(TYPES.WeaponService);
	const weapon = await weaponService.getWeapon(type);

	return weaponService.getEnhanceInfo(weapon, power);
};

/** 무기를 끝까지 강화하는데 필요한 정보 가져오기 */
export const getEnhanceInfoList = async (type: string) => {
	const weaponService = container.get<IWeaponService>(TYPES.WeaponService);
	const weapon = await weaponService.getWeapon(type);

	return weapon.ratioList.map((_, idx) => weaponService.getEnhanceInfo(weapon, idx));
};

export default {
	addWeapon,
	getWeapon,
	updateWeapon,
	getAllWeapon,
	getEnhanceInfo,
	getEnhanceInfoList,
};
