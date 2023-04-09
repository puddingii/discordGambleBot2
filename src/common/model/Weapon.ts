import { Schema, model } from 'mongoose';
import { TWeaponConstructor } from '../../interfaces/game/weapon';
import { IWeapon, IWeaponStatics } from '../../interfaces/model/weapon';

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
