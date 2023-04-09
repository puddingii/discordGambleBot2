import { Model, Types } from 'mongoose';
import { IStockModelResult } from './stock';
import { IWeaponModelResult } from './weapon';
import { TPopulatedList, TUserParam } from '../common/services/userService';
import { TPopulatedUserWeaponInfo } from '../game/user';

type TWeaponInfo = {
	weapon: IWeaponModelResult;
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

type TStockInfo = {
	stock: IStockModelResult;
	/** 가지고 있는 갯수 */
	cnt: number;
	/** 내 평균 포지션 */
	value: number;
};

export type TGiftInfo = {
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

export interface IUserModel extends Document, DoucmentResult<IUserModel> {
	/** 디스코드 아이디 */
	discordId: string;
	/** 웹 접속용 패스워드 */
	password: string;
	/** 내 닉네임 */
	nickname: string;
	/** 가지고 있는 돈 */
	money: number;
	/** 가지고 있는 주식 리스트 */
	stockList: Types.Array<TStockInfo>;
	/** 가지고 있는 무기 리스트 */
	weaponList: Types.Array<TWeaponInfo>;
	/** 선물 받은 리스트 */
	giftList: Types.Array<TGiftInfo>;
}

export type TUserModelResult = IUserModel & {
	_id: Types.ObjectId;
};

export interface IUserStatics extends Model<IUserModel> {
	/** 새로운 유저 추가 */
	addNewUser(discordId: string, nickname: string): Promise<void>;
	/** 새로운 주식 추가 */
	addNewStock(name: string): Promise<void>;
	/** 새로운 무기 추가 */
	addNewWeapon(type: string): Promise<void>;
	/** 선물 추가 */
	addGift(userParam: TUserParam, giftInfo: TGiftInfo): Promise<void>;
	/** 선물리스트 추가 */
	addGiftList(userParam: TUserParam, giftInfo: Array<TGiftInfo>): Promise<void>;
	/** 웹 패스워드 검증 */
	checkPassword(
		userInfo: Partial<{ discordId: string; nickname: string }>,
		password: string,
	): Promise<boolean>;
	/** 디스코드 아이디로 유저정보 가져오기 */
	findByUserInfo(
		userParam: TUserParam,
		populateList?: TPopulatedList,
	): Promise<TUserModelResult>;
	/** 모든 유저 가져오기 */
	getAllUserList(populateList?: TPopulatedList): Promise<Array<TUserModelResult>>;
	/** 웹 패스워드 발급 */
	updatePassword(discordId: string, myPassword: string): Promise<void>;
	/** 유저 돈 업데이트 */
	updateMoney(userInfo: TUserParam, money: number): Promise<boolean>;
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
	deleteGift(discordId: string, giftInfo: TGiftInfo): Promise<void>;
	/** 내 선물리스트에 있는 모든 돈을 정산해서 내 지갑에 넣기 */
	convertGiftListToMoney(userInfo: TUserParam): Promise<number>;
	/** 선물받은 돈 계산 */
	getReceivedAllGiftMoney(userInfo: TUserParam): Promise<number>;
}
