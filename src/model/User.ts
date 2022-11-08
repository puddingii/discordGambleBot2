import {
	Schema,
	Model,
	model,
	Types,
	HydratedDocument,
	Document,
	ClientSession,
} from 'mongoose';
import StockModel, { IStock } from './Stock';
import logger from '../config/logger';
import UserController from '../game/User/User';
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
	addNewUser(discordId: string, nickname: string): Promise<void>;
	addNewStock(name: string): Promise<void>;
	findByDiscordId(discordId: string): Promise<HydratedDocument<IUser>>;
	updateMoney(
		discordId: string,
		money: number,
		session?: ClientSession | null,
	): Promise<boolean>;
	updateWeaponAndMoney(
		discordId: string,
		updWeaponInfo: SwordController,
		money?: number,
	): Promise<boolean>;
	updateStockAndMoney(
		discordId: string,
		updStockInfo: {
			name: string;
			cnt: number;
			value: number;
		},
		money?: number,
	): Promise<boolean>;
	/** 유저가 가지고있는 주식 삭제 */
	deleteStockWithAllUser(name: string): Promise<void>;
	updateAll(userList: UserController[]): Promise<void>;
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

User.statics.addNewUser = async function (discordId: string, nickname: string) {
	const stockList = (await StockModel.findAllList('all')).map(stock => {
		return { stock: new Types.ObjectId(stock._id), cnt: 0, value: 0 };
	});

	const weaponList = [{ type: 'sword' }];

	await this.create({ discordId, nickname, stockList, weaponList });
};

User.statics.addNewStock = async function (name: string) {
	const stock = await StockModel.findOne({ name });
	if (!stock) {
		throw Error('해당하는 주식정보가 없습니다.');
	}

	await this.updateMany(
		{ $nor: [{ 'stockList.stock': new Types.ObjectId(stock._id) }] },
		{
			$push: { stockList: { stock: new Types.ObjectId(stock._id) } },
		},
	);
};

/** 아이디로 유저정보 탐색 */
User.statics.findByDiscordId = async function (discordId: string) {
	const userInfo = await this.findOne({ discordId }).populate('stockList.stock');
	return userInfo;
};

/** 유저 머니 업데이트 */
User.statics.updateMoney = async function (
	discordId: string,
	money: number,
	session = null,
) {
	const isSucceed = await this.findOneAndUpdate(
		{ discordId },
		{ $set: { money } },
		{ new: true },
	).session(session);
	return !!isSucceed;
};

User.statics.updateStockAndMoney = async function (
	discordId: string,
	updStockInfo: {
		name: string;
		cnt: number;
		value: number;
	},
	money?: number,
) {
	const stockInfo = await StockModel.findByName(updStockInfo.name);

	if (!stockInfo) {
		return false;
	}

	const setInfo: { [key: string]: number } = {
		'stockList.$.cnt': updStockInfo.cnt,
		'stockList.$.value': updStockInfo.value,
	};
	if (money) {
		setInfo.money = money;
	}

	const userInfo = await this.findOneAndUpdate(
		{ discordId, 'stockList.stock': new Types.ObjectId(stockInfo._id) },
		{ $set: setInfo },
		{ new: true },
	);

	return !!userInfo;
};

User.statics.deleteStockWithAllUser = async function (name: string) {
	const stock = await StockModel.findOne({ name });
	if (!stock) {
		throw Error('해당하는 주식정보가 없습니다.');
	}

	await this.updateMany(
		{ 'stockList.stock': new Types.ObjectId(stock._id) },
		{
			$pull: { stockList: { stock: new Types.ObjectId(stock._id) } },
		},
	);
};

/** 무기 업데이트 */
User.statics.updateWeaponAndMoney = async function (
	discordId: string,
	updWeaponInfo: SwordController,
	money?: number,
) {
	const setInfo: { [key: string]: number } = {
		'weaponList.$.bonusPower': updWeaponInfo.bonusPower,
		'weaponList.$.curPower': updWeaponInfo.curPower,
		'weaponList.$.destroyCnt': updWeaponInfo.destroyCnt,
		'weaponList.$.failCnt': updWeaponInfo.failCnt,
		'weaponList.$.successCnt': updWeaponInfo.successCnt,
		'weaponList.$.hitRatio': updWeaponInfo.hitRatio,
		'weaponList.$.missRatio': updWeaponInfo.missRatio,
	};
	if (money) {
		setInfo.money = money;
	}
	const userInfo = await this.findOneAndUpdate(
		{ discordId, 'weaponList.type': updWeaponInfo.type },
		{ $set: setInfo },
		{ new: true },
	);

	if (userInfo) {
		return true;
	}

	return false;
};

User.statics.updateAll = async function (userList: UserController[]) {
	const stockAllList = await StockModel.findAllList('all');
	const updPromiseList = userList.map(updUser => {
		const weaponList = updUser.weaponList.map(user => ({
			type: user.type,
			curPower: user.curPower,
			failCnt: user.failCnt,
			successCnt: user.successCnt,
			destroyCnt: user.destroyCnt,
			bonusPower: user.bonusPower,
			hitRatio: user.hitRatio,
			missRatio: user.missRatio,
		}));
		const stockList = updUser.stockList.reduce(
			(acc: Array<{ stock: IStock; cnt: number; value: number }>, stockInfo) => {
				const myStock = stockAllList.find(stock => stock.name === stockInfo.stock.name);
				if (myStock) {
					acc.push({ stock: myStock, cnt: stockInfo.cnt, value: stockInfo.value });
				}
				return acc;
			},
			[],
		);
		return this.findOneAndUpdate(
			{ discordId: updUser.getId() },
			{
				$set: { money: updUser.money, nickname: updUser.nickname, weaponList, stockList },
			},
		);
	});

	const resultList = await Promise.allSettled(updPromiseList);

	resultList.forEach(result => {
		if (result.status !== 'fulfilled') {
			logger.error(`${result.reason}`);
		}
	});
};

export default model<IUser, IUserStatics>('User', User);
