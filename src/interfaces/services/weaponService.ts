import { IWeaponStatics } from '../../model/Weapon';
import { IWeapon, TWeaponConstructor, TWeaponInfo } from '../game/weapon';

/** FIXME */
export type ValueOf<T> = T[keyof T];

export interface IWeaponService {
	weaponModel: IWeaponStatics;
	/** 무기추가 */
	addWeapon(param: TWeaponConstructor): Promise<IWeapon>;
	/** 강화비용 계산하기 */
	getCost(
		weapon: IWeapon,
		exponent: number,
		option?: { isPreventDown?: boolean; isPreventDestroy?: boolean },
	): number;
	/** 강화비용, 확률 등의 값 리턴 */
	getEnhanceInfo(
		weapon: IWeapon,
		power: number,
	): { success: number; fail: number; destroy: number; cost: number };
	/** 힘수치 계산해서 리턴 */
	getPower(weapon: IWeapon, power: number): number;
	/** 타입에 해당하는 무기정보 가져오기 */
	getWeapon(type: string): Promise<IWeapon>;
	/** 모든 무기정보 가져오기 */
	getAllWeapon(): Promise<Array<IWeapon>>;
	/** 무기정보 업데이트 */
	updateWeapon(weapon: IWeapon, param: Partial<TWeaponInfo>): Promise<void>;
}
