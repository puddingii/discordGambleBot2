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
	moneyBase: number;
	/** 강화확률 리스트 */
	ratioList: Types.Array<{ failRatio: number; destroyRatio: number }>;
}

export type IStockInfo = IWeapon & {
	_id: Types.ObjectId;
};

export interface IWeaponStatics extends Model<IWeapon> {
	s(s: number): string;
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

Weapon.statics.s = function (name: string, limitedCnt: number) {
	console.log('?');
};

export default model<IWeapon, IWeaponStatics>('Weapon', Weapon);
