import { Schema, Model, model, Types, Document, ClientSession } from 'mongoose';
import pwGenerator from 'generate-password';
import bcrypt from 'bcrypt';
import StockModel, { IStock } from './Stock';
import logger from '../config/logger';
import secretKey from '../config/secretKey';
import UserController, { UserWeaponInfo } from '../game/User/User';
import WeaponModel, { IWeapon } from './Weapon';

type WeaponInfo = {
	weapon: Types.ObjectId | IWeapon;
	destroyCnt: number;
	failCnt: number;
	successCnt: number;
	curPower: number;
	bonusPower: number;
	hitRatio: number;
	missRatio: number;
};

type StockInfo = {
	stock: Types.ObjectId | IStock;
	cnt: number;
	value: number;
};

interface DoucmentResult<T> {
	_doc: T;
}

interface IUser extends Document, DoucmentResult<IUser> {
	discordId: string;
	password: string;
	nickname: string;
	money: number;
	stockList: Types.Array<StockInfo>;
	weaponList: Types.Array<WeaponInfo>;
}

export type IUserInfo = IUser & {
	_id: Types.ObjectId;
};

interface IUserStatics extends Model<IUser> {
	addNewUser(discordId: string, nickname: string): Promise<void>;
	addNewStock(name: string): Promise<void>;
	checkPassword(
		userInfo: Partial<{ discordId: string; nickname: string }>,
		password: string,
	): Promise<boolean>;
	findByDiscordId(discordId: string): Promise<IUserInfo | null>;
	generatePassword(discordId: string): Promise<string>;
	updateMoney(
		discordId: string,
		money: number,
		session?: ClientSession | null,
	): Promise<boolean>;
	updateWeaponAndMoney(
		discordId: string,
		updWeaponInfo: UserWeaponInfo,
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
	password: {
		type: String,
		default: '',
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
				required: true,
			},
			cnt: {
				type: Number,
				default: 0,
			},
			value: {
				type: Number,
				default: 0,
			},
		},
	],
	weaponList: [
		{
			weapon: {
				type: Schema.Types.ObjectId,
				ref: 'Weapon',
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
	const weaponList = (await WeaponModel.findAllList()).map(weapon => {
		return { weapon: new Types.ObjectId(weapon._id) };
	});

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

/** 비밀번호 (재)발급 */
User.statics.generatePassword = async function (discordId: string) {
	const myPassword = pwGenerator.generate({ length: 12, numbers: true });
	const encryptedPassword = await bcrypt.hash(myPassword, secretKey.passwordHashRound);

	await this.findOneAndUpdate({ discordId }, { $set: { password: encryptedPassword } });
	return myPassword;
};

/** 비밀번호 체크 */
User.statics.checkPassword = async function (
	userInfo: Partial<{
		discordId: string;
		nickname: string;
	}>,
	password: string,
) {
	if (!userInfo.nickname && !userInfo.discordId) {
		throw Error('사용자 정보를 하나 이상 입력해주세요');
	}
	const myInfo = await this.findOne(userInfo);
	if (!myInfo || !myInfo.password) {
		throw Error('회원정보가 없거나 패스워드를 발급받지 않았습니다.');
	}
	const isVaild = await bcrypt.compare(password, myInfo.password);

	return isVaild;
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
	updWeaponInfo: UserWeaponInfo,
	money?: number,
) {
	const weapon = await WeaponModel.findOne({ type: updWeaponInfo.weapon.type });
	if (!weapon) {
		throw Error('해당하는 무기정보가 없습니다.');
	}

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
		{ discordId, 'weaponList.weapon': new Types.ObjectId(weapon._id) },
		{ $set: setInfo },
		{ new: true },
	);

	return !!userInfo;
};

User.statics.updateAll = async function (userList: UserController[]) {
	const stockAllList = await StockModel.findAllList('all');
	const weaponAllList = await WeaponModel.findAllList();
	const updPromiseList = userList.map(updUser => {
		const weaponList = updUser.weaponList.reduce((acc: Array<WeaponInfo>, weaponInfo) => {
			const myWeapon = weaponAllList.find(
				weapon => weapon.type === weaponInfo.weapon.type,
			);
			myWeapon &&
				acc.push({
					weapon: myWeapon,
					bonusPower: weaponInfo.bonusPower,
					curPower: weaponInfo.curPower,
					destroyCnt: weaponInfo.destroyCnt,
					failCnt: weaponInfo.failCnt,
					hitRatio: weaponInfo.hitRatio,
					missRatio: weaponInfo.missRatio,
					successCnt: weaponInfo.successCnt,
				});
			return acc;
		}, []);
		const stockList = updUser.stockList.reduce((acc: Array<StockInfo>, stockInfo) => {
			const myStock = stockAllList.find(stock => stock.name === stockInfo.stock.name);
			myStock && acc.push({ stock: myStock, cnt: stockInfo.cnt, value: stockInfo.value });
			return acc;
		}, []);
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
