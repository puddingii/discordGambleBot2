import { Schema, Model, model, Types, Document } from 'mongoose';
import { TWeaponConstructor } from '../../interfaces/game/weapon';

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

const Weapon = new Schema<IWeapon, IWeaponStatics>({
	type: {
		type: String,
		unique: true,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	comment: {
		type: String,
		default: '',
	},
	maxPower: {
		type: Number,
		default: 30,
	},
	powerMultiple: {
		type: Number,
		default: 1,
	},
	enhanceCost: {
		type: Number,
		required: true,
	},
	baseMoney: {
		type: Number,
		default: 1.2,
	},
	ratioList: [
		{
			failRatio: {
				type: Number,
				required: true,
			},
			destroyRatio: {
				type: Number,
				required: true,
			},
		},
	],
});

Weapon.statics.findAllList = async function () {
	const weaponList = await this.find({});
	return weaponList ?? [];
};

Weapon.statics.addWeapon = async function (weaponInfo: TWeaponConstructor) {
	const isExist = await this.exists({ type: weaponInfo.type });
	if (isExist) {
		throw Error('같은 타입의 무기가 있습니다');
	}
	const weapon = await this.create({
		type: weaponInfo.type,
		name: weaponInfo.name,
		comment: weaponInfo.comment,
		powerMultiple: weaponInfo.powerMultiple,
		enhanceCost: weaponInfo.enhanceCost,
		baseMoney: weaponInfo.baseMoney,
		ratioList: weaponInfo.ratioList,
	});
	return weapon;
};

Weapon.statics.updateWeapon = async function (updatedWeaponInfo: TWeaponConstructor) {
	await this.findOneAndUpdate(
		{ type: updatedWeaponInfo.type },
		{
			comment: updatedWeaponInfo.comment,
			name: updatedWeaponInfo.name,
			baseMoney: updatedWeaponInfo.baseMoney,
			enhanceCost: updatedWeaponInfo.enhanceCost,
			maxPower: updatedWeaponInfo.maxPower,
			powerMultiple: updatedWeaponInfo.powerMultiple,
			ratioList: updatedWeaponInfo.ratioList,
		},
	);
};

export default model<IWeapon, IWeaponStatics>('Weapon', Weapon);