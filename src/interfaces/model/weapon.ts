import { Model, Types } from 'mongoose';
import { TWeaponConstructor } from '../game/weapon';

interface DoucmentResult<T> {
	_doc: T;
}

export interface IWeapon extends Document, DoucmentResult<IWeapon> {
	/** sword, pickaxe */
	type: string;
	/** name */
	name: string;
	/** 설명 */
	comment: string;
	/** 무기의 힘 배율 (강화수 * 배율 = 힘) */
	powerMultiple: number;
	/** 강화비용 */
	enhanceCost: number;
	/** 강화비용 지수함수의 밑 */
	baseMoney: number;
	/** 강화확률 리스트 */
	ratioList: Types.Array<{ failRatio: number; destroyRatio: number }>;
	/** 강화 맥스치 */
	maxPower: number;
}

export type IWeaponInfo = IWeapon & {
	_id: Types.ObjectId;
};

export interface IWeaponStatics extends Model<IWeapon> {
	/** 모든 무기정보 가져오기 */
	findAllList(): Promise<Array<IWeaponInfo>>;
	/** 무기추가 */
	addWeapon(weaponInfo: TWeaponConstructor): Promise<IWeaponInfo>;
	/** 무기 단일 업데이트(주식 히스토리 미누적) */
	updateWeapon(updatedWeaponInfo: TWeaponConstructor): Promise<void>;
}
