import { Schema, model, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import StockModel from './Stock';
import secretKey from '../../config/secretKey';
import WeaponModel from './Weapon';
import { TPopulatedUserWeaponInfo } from '../../interfaces/game/user';
import { TPopulatedList, TUserParam } from '../../interfaces/common/services/userService';
import { IUserModel, IUserStatics, TGiftInfo } from '../../interfaces/model/user';

const User = new Schema<IUserModel, IUserStatics>({
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
User.statics.findByUserInfo = async function (
	userParam: TUserParam,
	populateList?: TPopulatedList,
) {
	let userInfo = this.findOne(userParam);
	if (populateList) {
		userInfo = populateList?.reduce((acc, cur) => {
			if (cur === 'stockList.stock') {
				acc.populate(
					cur,
					'name type value comment minRatio maxRatio updateTime correctionCnt conditionList dividend',
				);
			} else {
				acc.populate(cur);
			}
			return acc;
		}, userInfo);
	}
	const user = await userInfo.exec();
	if (!user) {
		throw Error('해당하는 유저정보가 없습니다');
	}

	return user;
};

User.statics.getAllUserList = async function (populateList?: TPopulatedList) {
	let userInfo = this.find({});
	if (populateList) {
		userInfo = populateList?.reduce((acc, cur) => {
			if (cur === 'stockList.stock') {
				acc.populate(
					cur,
					'name type value comment minRatio maxRatio updateTime correctionCnt conditionList dividend',
				);
			} else {
				acc.populate(cur);
			}
			return acc;
		}, userInfo);
	}
	const userList = await userInfo.exec();

	return userList;
};

/** 비밀번호 (재)발급 */
User.statics.updatePassword = async function (discordId: string, myPassword: string) {
	const encryptedPassword = await bcrypt.hash(myPassword, secretKey.passwordHashRound);

	await this.findOneAndUpdate({ discordId }, { $set: { password: encryptedPassword } });
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
User.statics.updateMoney = async function (userInfo: TUserParam, money: number) {
	const isSucceed = await this.findOneAndUpdate(
		userInfo,
		{ $set: { money } },
		{ new: true },
	);
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

User.statics.addGift = async function (userParam: TUserParam, giftInfo: TGiftInfo) {
	await this.findOneAndUpdate(userParam, {
		$push: { giftList: giftInfo },
	});
};

User.statics.addGiftList = async function (
	userParam: TUserParam,
	giftList: Array<TGiftInfo>,
) {
	await this.findOneAndUpdate(userParam, {
		$push: { giftList: { $each: giftList } },
	});
};

User.statics.deleteGift = async function (discordId: string, giftInfo: TGiftInfo) {
	await this.findOneAndUpdate({ discordId }, { $pull: { giftList: giftInfo } });
};

User.statics.deleteAllGift = async function (discordId: string, type: string) {
	await this.findOneAndUpdate({ discordId }, { $pullAll: { giftList: { type } } });
};

User.statics.convertGiftListToMoney = async function (userParam: TUserParam) {
	const user = await this.findOneAndUpdate(userParam, {
		$pull: { giftList: { type: 'money' } },
	});
	const totalMoney =
		user?.giftList.reduce((sum, gift) => {
			if (gift.type === 'money') {
				return sum + gift.value;
			}
			return sum;
		}, 0) ?? 0;

	await this.findOneAndUpdate(userParam, { $inc: { money: totalMoney } });

	return totalMoney;
};

User.statics.getReceivedAllGiftMoney = async function (userInfo: TUserParam) {
	const giftList = await this.aggregate([
		{ $match: userInfo },
		{ $project: { giftList: '$giftList' } },
		{ $unwind: { path: '$giftList' } },
		{ $match: { 'giftList.type': 'money' } },
	]);
	return giftList.reduce((acc, giftInfo) => acc + giftInfo.giftList.value, 0);
};

export default model<IUserModel, IUserStatics>('User', User);
