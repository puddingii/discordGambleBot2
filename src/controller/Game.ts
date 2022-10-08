import User from './User';
import Weapon from './Weapon/Weapon';
import Gamble from './Gamble/Gamble';

interface GameConstructor {
	userList: User[];
	gamble: Gamble;
	weapon: Weapon;
	grantMoney?: number;
}

interface DefaultResult {
	code: number;
	message?: string;
}

export default class Game {
	private static instance: undefined | Game;
	static userList: User[];

	/** 디스코드 아이디를 가지고 유저클래스 찾기 */
	static getUser({
		discordId,
		nickname,
	}: Partial<{
		discordId: string;
		nickname: string;
	}>): User | undefined {
		if (discordId) {
			return this.userList.find(userInfo => userInfo.getId() === discordId);
		}
		return this.userList.find(userInfo => userInfo.nickname === nickname);
	}

	gamble: Gamble;
	grantMoney: number;
	weapon: Weapon;

	/** 싱글톤으로 관리 */
	constructor({ gamble, weapon, grantMoney, userList }: GameConstructor) {
		this.gamble = gamble;
		this.weapon = weapon;
		this.grantMoney = grantMoney ?? 0;
		if (Game.instance) {
			// eslint-disable-next-line no-constructor-return
			return Game.instance;
		}

		Game.userList = userList;
		Game.instance = this;
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
	}: Partial<{
		discordId: string;
		nickname: string;
	}>): User | undefined {
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

// export default class Game {
// 	private static instance = new Game();

// 	static getInstance(): Game {
// 		return Game.instance;
// 	}
// 	gamble: undefined | Gamble;
// 	grantMoney = 0;
// 	userList: User[] = [];
// 	weapon: undefined | Weapon;

// 	private constructor() {
// 		if (Game.instance) {
// 			throw new Error('getInstance를 호출하세요');
// 		}
// 		Game.instance = this;
// 	}

// 	/** 유저등록 */
// 	addUser(myInfo: { id: string; nickname: string }): DefaultResult {
// 		const isExistUser = this.getUser({ discordId: myInfo.id });
// 		if (isExistUser) {
// 			return { code: 0, message: '이미 있는 유저입니다.' };
// 		}
// 		const user = new User(myInfo);
// 		this.userList.push(user);
// 		return { code: 1 };
// 	}
// 	/** 유저클래스 찾기 */
// 	getUser({
// 		discordId,
// 		nickname,
// 	}: {
// 		discordId?: string;
// 		nickname?: string;
// 	}): User | undefined {
// 		if (discordId) {
// 			return this.userList.find(userInfo => userInfo.getId() === discordId);
// 		}
// 		return this.userList.find(userInfo => userInfo.nickname === nickname);
// 	}
// 	/** 유저리스트 가져오기 */
// 	getUserList(): User[] {
// 		return this.userList;
// 	}
// 	setParam({ gamble, weapon, userList, grantMoney }: GameConstructor) {
// 		this.gamble = gamble;
// 		this.weapon = weapon;
// 		this.userList = userList;
// 		this.grantMoney = grantMoney;
// 	}

// 	/** 보조금 업데이트 */
// 	updateGrantMoney() {
// 		if (!this.grantMoney) {
// 			return;
// 		}
// 		this.grantMoney += 210 + this.grantMoney * 0.02;
// 		if (this.grantMoney > 5_000_000) {
// 			this.grantMoney = 5_000_000;
// 		}
// 	}
// }
