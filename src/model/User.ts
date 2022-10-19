import { Schema, Model, model, Types, HydratedDocument, Document } from 'mongoose';
import StockModel, { IStock, IStockStatics } from './Stock';
import logger from '../config/logger';
import UserContorller from '../game/User/User';
import SwordController from '../game/Weapon/Sword';

interface WeaponInfo {
	type: 'sword' | 'pickaxe';
	destroyCnt: number;
	failCnt: number;
	successCnt: number;
	curPower: number;
	bonusPower: number;
	hitRatio: number;
	missRatio: number;
}

interface DoucmentResult<T> {
	_doc: T;
}

interface IUser extends Document, DoucmentResult<IUser> {
	discordId: string;
	nickname: string;
	money: number;
	stockList: Types.Array<{
		stock: Types.ObjectId | IStock;
		cnt: number;
		value: number;
	}>;
	weaponList: Types.Array<WeaponInfo>;
}

interface IUserStatics extends Model<IUser> {
	findByDiscordId(discordId: string): Promise<HydratedDocument<IUser>>;
	updateStock(
		discordId: string,
		updStockInfo: {
			name: string;
			cnt: number;
			value: number;
			money: number;
		},
	): Promise<{ code: number; message?: string }>;
	updateMoney(userList: UserContorller[]): Promise<void>;
	updateWeapon(
		discordId: string,
		updWeaponInfo: SwordController,
		money: number,
	): Promise<{
		code: number;
		message?: string;
	}>;
}

interface PopulatedParent {
	'stockList.stock': IStockStatics | null;
}

const User = new Schema<IUser, IUserStatics>({
	discordId: {
		type: String,
		unique: true,
		required: true,
	},
	nickname: {
		type: String,
		unique: true,
		required: true,
	},
	money: {
		type: Number,
		default: 1000000,
	},
	stockList: [
		{
			stock: {
				type: Schema.Types.ObjectId,
				ref: 'Stock',
			},
			cnt: {
				type: Number,
				default: 0,
			},
			value: {
				type: Number,
				required: true,
			},
		},
	],
	weaponList: [
		{
			/** 타입 weapon or pickaxe */
			type: {
				type: String,
				required: true,
			},
			/** 터진수 */
			destroyCnt: {
				type: Number,
				default: 0,
			},
			/** 실패수 */
			failCnt: {
				type: Number,
				default: 0,
			},
			/** 성공수 */
			successCnt: {
				type: Number,
				default: 0,
			},
			/** 현재 강화된 정도(파워는 강화된 수 * 3) */
			curPower: {
				type: Number,
				default: 0,
			},
			/** 추가 파워 */
			bonusPower: {
				type: Number,
				default: 0,
			},
			/** 최대 적중률은 300% */
			hitRatio: {
				type: Number,
				default: 1,
				max: 3,
			},
			/** 최대 회피율은 70% */
			missRatio: {
				type: Number,
				default: 0,
				max: 0.7,
			},
		},
	],
});

/** 아이디로 유저정보 탐색 */
User.statics.findByDiscordId = async function (discordId: string) {
	const userInfo = await this.findOne({ discordId }).populate('stockList.stock');
	return userInfo;
};

/** 주식정보 업데이트 */
User.statics.updateStock = async function (
	discordId: string,
	updStockInfo: {
		name: string;
		cnt: number;
		value: number;
		money: number;
	},
) {
	const userInfo = await this.findOne({ discordId }).populate<
		Pick<PopulatedParent, 'stockList.stock'>
	>('stockList.stock');
	if (!userInfo) {
		return { code: 0, message: '[DB]유저정보를 찾을 수 없습니다.' };
	}

	const myStock = userInfo.stockList.find(myStock => {
		return (
			myStock.stock instanceof StockModel && myStock.stock.name === updStockInfo.name
		);
	});

	if (myStock) {
		myStock.value = updStockInfo.value;
		myStock.cnt = updStockInfo.cnt;
	} else {
		// 아예 처음사는 경우
		const stock = await StockModel.findByName(updStockInfo.name);
		if (!stock) {
			return { code: 0, message: '[DB]주식정보를 찾을 수 없습니다.' };
		}
		userInfo.stockList.push({
			stock,
			value: updStockInfo.value,
			cnt: updStockInfo.cnt,
		});
	}
	userInfo.money = updStockInfo.money;

	await userInfo.save();
	return { code: 1 };
};

/** 유저 머니 업데이트 */
User.statics.updateMoney = async function (userList: UserContorller[]) {
	const updPromiseList = userList.map(async updUser => {
		const user = await this.findOne({ discordId: updUser.getId() });
		if (!user) {
			return {
				status: 'rejected',
				reason: '없는 유저로 머니 업데이트를 할 수 없습니다.',
			};
		}
		user.money = updUser.money;
		return user.save();
	});

	const resultList = await Promise.allSettled(updPromiseList);

	resultList.forEach(result => {
		if (result.status !== 'fulfilled') {
			logger.error(`${result.reason}`);
		}
	});
};

/** 무기 업데이트 */
User.statics.updateWeapon = async function (
	discordId: string,
	updWeaponInfo: SwordController,
	money: number,
) {
	const userInfo = await this.findOne({ discordId });
	if (!userInfo) {
		return { code: 0, message: '[DB]유저정보를 찾을 수 없습니다.' };
	}

	const myWeapon = userInfo.weaponList.find(weapon => {
		return weapon.type === updWeaponInfo.type;
	});

	if (myWeapon) {
		myWeapon.bonusPower = updWeaponInfo.bonusPower;
		myWeapon.curPower = updWeaponInfo.curPower;
		myWeapon.destroyCnt = updWeaponInfo.destroyCnt;
		myWeapon.failCnt = updWeaponInfo.failCnt;
		myWeapon.successCnt = updWeaponInfo.successCnt;
		myWeapon.hitRatio = updWeaponInfo.hitRatio;
		myWeapon.missRatio = updWeaponInfo.missRatio;
	} else {
		userInfo.weaponList.push({
			type: updWeaponInfo.type,
			curPower: updWeaponInfo.curPower,
			failCnt: updWeaponInfo.failCnt,
			successCnt: updWeaponInfo.successCnt,
			destroyCnt: updWeaponInfo.destroyCnt,
			bonusPower: updWeaponInfo.bonusPower,
			hitRatio: updWeaponInfo.hitRatio,
			missRatio: updWeaponInfo.missRatio,
		});
	}
	userInfo.money = money;

	await userInfo.save();
	return { code: 1 };
};

export default model<IUser, IUserStatics>('User', User);
