import { IWeapon, TWeaponConstructor } from '../../game/weapon';
import { IWeaponService } from '../services/weaponService';

type TEnhanceInfo = { success: number; fail: number; destroy: number; cost: number };

export interface IWeaponController {
	weaponService: IWeaponService;
	/** 무기 가져오기 */
	getWeapon(type: string): Promise<IWeapon>;
	/** 무기 업데이트 */
	updateWeapon(param: TWeaponConstructor): Promise<void>;
	/** 모든 무기 다 가져오기 */
	getAllWeapon(): Promise<Array<IWeapon>>;
	/** 무기를 끝까지 강화하는데 필요한 정보 가져오기 */
	getEnhanceInfo(type: string, power: number): Promise<TEnhanceInfo>;
	/** 현재 상태의 무기를 강화하는데 필요한 정보 가져오기 */
	getEnhanceInfoList(type: string): Promise<Array<TEnhanceInfo>>;
}
