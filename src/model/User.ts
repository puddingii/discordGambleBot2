import { Schema, Model, model, Types, Document, ClientSession } from 'mongoose';
import pwGenerator from 'generate-password';
import bcrypt from 'bcrypt';
import StockModel, { IStock } from './Stock';
import secretKey from '../config/secretKey';
import WeaponModel, { IWeapon } from './Weapon';
import { TPopulatedUserWeaponInfo } from '../interfaces/game/user';
import { TUserParam } from '../interfaces/services/userService';

type UserParam = Partial<{
	discordId: string;
	nickname: string;
}>;

type WeaponInfo = {
	weapon: Types.ObjectId | IWeapon;
	/** 터진수 */
	destroyCnt: number;
	/** 실패수 */
	failCnt: number;
	/** 성공수 */
	successCnt: number;
	/** 현재 강화된 정도(파워는 강화된 수 * 3) */
	curPower: number;
	/** 추가 파워 */
	bonusPower: number;
	/** 최대 적중률은 300% */
	hitRatio: number;
	/** 최대 회피율은 70% */
	missRatio: number;
};

type StockInfo = {
	stock: Types.ObjectId | IStock;
	/** 가지고 있는 갯수 */
	cnt: number;
	/** 내 평균 포지션 */
	value: number;
};

type GiftInfo = {
	/** 선물 타입 */
	type: string;
	/** 가치나 카운트 */
	value: number;
	/** 코멘트 */
	comment: string;
};

interface DoucmentResult<T> {
	_doc: T;
}

interface IUser extends Document, DoucmentResult<IUser> {
	/** 디스코드 아이디 */
	discordId: string;
	/** 웹 접속용 패스워드 */
	password: string;
	/** 내 닉네임 */
	nickname: string;
	/** 가지고 있는 돈 */
	money: number;
	/** 가지고 있는 주식 리스트 */
	stockList: Types.Array<StockInfo>;
	/** 가지고 있는 무기 리스트 */
	weaponList: Types.Array<WeaponInfo>;
	/** 선물 받은 리스트 */
	giftList: Types.Array<GiftInfo>;
}

export type TUserModelInfo = IUser & {
	_id: Types.ObjectId;
};

export interface IUserStatics extends Model<IUser> {
	/** 새로운 유저 추가 */
	addNewUser(discordId: string, nickname: string): Promise<void>;
	/** 새로운 주식 추가 */
	addNewStock(name: string): Promise<void>;
	/** 새로운 무기 추가 */
	addNewWeapon(type: string): Promise<void>;
	/** 선물 추가 */
	addGift(userParam: TUserParam, giftInfo: GiftInfo): Promise<void>;
	/** 선물리스트 추가 */
	addGiftList(userParam: TUserParam, giftInfo: Array<GiftInfo>): Promise<void>;
	/** 웹 패스워드 검증 */
	checkPassword(
		userInfo: Partial<{ discordId: string; nickname: string }>,
		password: string,
	): Promise<boolean>;
	/** 디스코드 아이디로 유저정보 가져오기 */
	findByDiscordId(
		discordId: string,
		populateList?: Array<string>,
	): Promise<TUserModelInfo | null>;
	/** 웹 패스워드 발급 */
	generatePassword(discordId: string): Promise<string>;
	/** 유저 돈 업데이트 */
	updateMoney(
		userInfo: UserParam,
		money: number,
		session?: ClientSession | null,
	): Promise<boolean>;
	/** 무기와 돈 같이 업데이트 */
	updateWeaponAndMoney(
		discordId: string,
		updWeaponInfo: TPopulatedUserWeaponInfo,
		money?: number,
	): Promise<boolean>;
	/** 주식과 돈 같이 업데이트 */
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
	/** 유저가 가지고 있는 type이 같은 선물들 모두 삭제 */
	deleteAllGift(discordId: string, type: string): Promise<void>;
	/** 유저가 가지고 있는 type과 value가 같은 선물 단일삭제 */
	deleteGift(discordId: string, giftInfo: GiftInfo): Promise<void>;
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
			destroyCnt: {
				type: Number,
				default: 0,
			},
			failCnt: {
				type: Number,
				default: 0,
			},
			successCnt: {
				type: Number,
				default: 0,
			},
			curPower: {
				type: Number,
				default: 0,
			},
			bonusPower: {
				type: Number,
				default: 0,
			},
			hitRatio: {
				type: Number,
				default: 1,
				max: 3,
			},
			missRatio: {
				type: Number,
				default: 0,
				max: 0.7,
			},
		},
	],
	giftList: [
		{
			type: {
				type: String,
				required: true,
			},
			value: {
				type: Number,
				default: 0,
			},
			comment: {
				type: String,
				default: '',
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

User.statics.addNewWeapon = async function (type: string) {
	const weapon = await WeaponModel.findOne({ type });
	if (!weapon) {
		throw Error('해당하는 주식정보가 없습니다.');
	}

	await this.updateMany(
		{ $nor: [{ 'weaponList.weapon': new Types.ObjectId(weapon._id) }] },
		{
			$push: { weaponList: { weapon: new Types.ObjectId(weapon._id) } },
		},
	);
};

/** 아이디로 유저정보 탐색 */
User.statics.findByDiscordId = async function (
	discordId: string,
	populateList?: Array<string>,
) {
	let userInfo = await this.findOne({ discordId });
	if (!userInfo) {
		throw Error('해당하는 유저정보가 없습니다');
	}

	if (populateList && populateList.length > 0) {
		userInfo = await userInfo.populate(populateList.join(' '));
	}

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
	userInfo: UserParam,
	money: number,
	session = null,
) {
	const isSucceed = await this.findOneAndUpdate(
		userInfo,
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
			$pullAll: { stockList: { stock: new Types.ObjectId(stock._id) } },
		},
	);
};

/** 무기 업데이트 */
User.statics.updateWeaponAndMoney = async function (
	discordId: string,
	updWeaponInfo: TPopulatedUserWeaponInfo,
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

User.statics.addGift = async function (userParam: TUserParam, giftInfo: GiftInfo) {
	await this.findOneAndUpdate(userParam, {
		$push: { giftList: giftInfo },
	});
};

User.statics.addGiftList = async function (
	userParam: TUserParam,
	giftList: Array<GiftInfo>,
) {
	await this.findOneAndUpdate(userParam, {
		$push: { giftList: { $each: giftList } },
	});
};

User.statics.deleteGift = async function (discordId: string, giftInfo: GiftInfo) {
	await this.findOneAndUpdate({ discordId }, { $pull: { giftList: giftInfo } });
};

User.statics.deleteAllGift = async function (discordId: string, type: string) {
	await this.findOneAndUpdate({ discordId }, { $pullAll: { giftList: { type } } });
};

export default model<IUser, IUserStatics>('User', User);
