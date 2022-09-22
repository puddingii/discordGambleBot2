import User from './User';
import Weapon from './Weapon/Weapon';
import Gamble from './Gamble/Gamble';

// FIXME

interface GameConstructor {
	userList: User[];
	gamble: Gamble;
	weapon: Weapon;
	grantMoney: number;
}

interface DefaultResult {
	code: number;
	message?: string;
}


export default class Game {
	private static instance: Game;
	static userList: User[];

	/** 디스코드 아이디를 가지고 유저클래스 찾기 */
	static getUser({
		discordId,
		nickname,
	}: {
		discordId?: string;
		nickname?: string;
	}): User | undefined {
		if (discordId) {
			return this.userList.find(userInfo => userInfo.getId() === discordId);
		}
		return this.userList.find(userInfo => userInfo.nickname === nickname);
	}

	gamble;
	grantMoney;
	weapon;

	/**
	 * 싱글톤으로 관리
	 * @param {GameInitInfo}
	 */
	private constructor() {
		if (Game.instance) {
			// eslint-disable-next-line no-constructor-return
			return Game.instance;
		}
		this.gamble = gamble;
		this.weapon = weapon;
		this.grantMoney = grantMoney ?? 0;
		Game.userList = userList;
		Game.instance = this;
	}

	static setInstance(): Game {
		if (!Game.instance) {
			Game.instance = new Game({ userList, gamble, weapon, grantMoney }: GameConstructor);
		}
	}

	/** 유저등록 */
	addUser(myInfo: { id: string; nickname: string }): DefaultResult {
		const isExistUser = this.getUser({ discordId: myInfo.id });
		if (isExistUser) {
			return { code: 0, message: '이미 있는 유저입니다.' };
		}
		const user = new User(myInfo);
		Game.userList.push(user);
		return { code: 1 };
	}

	/** 유저클래스 찾기 */
	getUser({
		discordId,
		nickname,
	}: {
		discordId?: string;
		nickname?: string;
	}): User | undefined {
		if (discordId) {
			return Game.userList.find(userInfo => userInfo.getId() === discordId);
		}
		return Game.userList.find(userInfo => userInfo.nickname === nickname);
	}

	/** 유저리스트 가져오기 */
	getUserList(): User[] {
		return Game.userList;
	}

	/** 보조금 업데이트 */
	updateGrantMoney() {
		this.grantMoney += 210 + this.grantMoney * 0.02;
		if (this.grantMoney > 5_000_000) {
			this.grantMoney = 5_000_000;
		}
	}
}
