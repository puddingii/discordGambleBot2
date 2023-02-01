import { Schema, Model, model, Types, Document } from 'mongoose';
import SwordClass from '../game/Weapon/Sword';

interface DoucmentResult<T> {
	_doc: T;
}

export interface IWeapon extends Document, DoucmentResult<IWeapon> {
	/** sword, pickaxe */
	type: string;
	/** 설명 */
	comment: string;
	/** 무기의 힘 배율 (강화수 * 배율 = 힘) */
	powerMultiple: number;
	/** 강화비용 */
	enhanceCost: number;
	/** 강화비용 지수함수의 밑 */
	moneyBase: number;
	/** 강화확률 리스트 */
	ratioList: Types.Array<{ failRatio: number; destroyRatio: number }>;
}

export type IWeaponInfo = IWeapon & {
	_id: Types.ObjectId;
};

export interface IWeaponStatics extends Model<IWeapon> {
	/** 모든 무기정보 가져오기 */
	findAllList(): Promise<Array<IWeaponInfo>>;
}

const Weapon = new Schema<IWeapon, IWeaponStatics>({
	type: {
		type: String,
		unique: true,
		required: true,
	},
	comment: {
		type: String,
		default: '',
	},
	powerMultiple: {
		type: Number,
		default: 1,
	},
	enhanceCost: {
		type: Number,
		required: true,
	},
	moneyBase: {
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

Weapon.statics.addWeapon = async function (weaponInfo: SwordClass) {
	const isExist = await this.exists({ type: weaponInfo.type });
	if (isExist) {
		return { code: 0, message: '같은 이름이 있습니다.' };
	}
	await this.create({
		type: weaponInfo.type,
		comment: weaponInfo.comment,
		powerMultiple: weaponInfo.powerMultiple,
		enhanceCost: weaponInfo.enhanceCost,
		moneyBase: weaponInfo.moneyBase,
		ratioList: weaponInfo.ratioList,
	});
	return { code: 1 };
};

export default model<IWeapon, IWeaponStatics>('Weapon', Weapon);
