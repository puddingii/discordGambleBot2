import { IWeaponStatics } from '../../../common/model/Weapon';
import { IFormatter } from '../../../common/util/formatter';
import { IWeapon, TWeaponConstructor, TWeaponInfo } from '../../game/weapon';

/** FIXME */
export type ValueOf<T> = T[keyof T];

export type TEnhanceSimulateResult = {
	/** 1: 성공, 2: 실패, 3: 터짐 */
	code: 1 | 2 | 3;
	cost: number;
};

export interface IWeaponService {
	weaponModel: IWeaponStatics;
	formatter: IFormatter;
	/** 무기추가 */
	addWeapon(param: TWeaponConstructor): Promise<IWeapon>;
	/** 강화비용 계산하기 */
	getCost(
		weapon: IWeapon,
		exponent: number,
		option?: Partial<{ isPreventDown: boolean; isPreventDestroy: boolean }>,
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
	/** 무기강화 시뮬레이트 결과 리턴 */
	simulateWeaponEnhance(weapon: IWeapon, power: number): TEnhanceSimulateResult;
	/** 무기정보 업데이트 */
	updateWeapon(weapon: IWeapon, param: Partial<TWeaponInfo>): Promise<void>;
}
