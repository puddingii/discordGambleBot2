import { IUser, TPopulatedUserWeaponInfo, TUserWeaponInfo } from '../../game/user';
import { IStatusService } from '../services/statusService';
import {
	IUserService,
	TPopulatedList,
	TProcessedStockInfo,
	TUserParam,
} from '../services/userService';

export interface IUserController {
	userService: IUserService;
	statusService: IStatusService;
	/** 신규유저 추가 */
	addUser(userInfo: { id: string; nickname: string }): Promise<void>;
	/** 다른 사람한테 돈 기부 */
	giveMoney(myInfo: TUserParam, ptrInfo: TUserParam, money: number): Promise<void>;
	/** 유저정보 반환 */
	getUser(userInfo: TUserParam, populatedList?: TPopulatedList): Promise<IUser>;
	/** 내 특정 무기 가져오기 */
	getMyWeapon(
		discordId: string,
		type: string,
	): Promise<TPopulatedUserWeaponInfo | undefined>;
	/** 내 무기들 가져오기 */
	getMyWeaponList(discordId: string): Promise<Array<TUserWeaponInfo>>;
	/** 게임에 참여하는 유저리스트 반환 */
	getUserList(populatedList?: TPopulatedList): Promise<Array<IUser>>;
	/** 내가 1개 이상 가지고 있는 주식리스트 */
	getMyStockList(discordId: string): Promise<TProcessedStockInfo>;
	/** 주식 + 내돈 합친 값 */
	getRankingList(): Promise<Array<{ name: string; money: number }>>;
	/** 돈 갱신 */
	updateMoney(userInfo: TUserParam, value: number): Promise<IUser>;
	/** 랜덤패스워드 생성 및 저장 */
	generatePassword(discordId: string): Promise<string>;
	/** 보조금 유저에게 지급 */
	giveGrantMoney(discordId: string): Promise<number>;
	/** 선물받은 돈 전부 받기 */
	receiveAllGiftMoney(discordId: string): Promise<number>;
}
