import { Schema, Model, model, Types, Document } from 'mongoose';

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
	const stockList = await this.find({});
	return stockList ?? [];
};

export default model<IWeapon, IWeaponStatics>('Weapon', Weapon);
