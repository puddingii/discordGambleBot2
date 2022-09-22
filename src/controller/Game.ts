import Gamble from './Gamble/Gamble';
import User from './User';
import Weapon from './Weapon/Weapon';
// FIXME 아직 미완성
export default class Game {
	static instance;
	static userList: User[];

	/** 디스코드 아이디를 가지고 유저클래스 찾기 */
	static getUser({ discordId, nickname }: { discordId?: string; nickname?: string }) {
		if (discordId) {
			return this.userList.find(userInfo => userInfo.getId() === discordId);
		}
		return this.userList.find(userInfo => userInfo.nickname === nickname);
	}

	/**
	 * 싱글톤으로 관리
	 * @param {GameInitInfo}
	 */
	constructor({ userList, gamble, weapon, grantMoney }) {
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

	/**
	 * 유저등록
	 * @param {{ id: string, nickname: string }} myInfo
	 * @return {DefaultResult}
	 */
	addUser(myInfo) {
		const isExistUser = this.getUser({ discordId: myInfo.id });
		if (isExistUser) {
			return { code: 0, message: '이미 있는 유저입니다.' };
		}
		const user = new User(myInfo);
		Game.userList.push(user);
		return { code: 1 };
	}

	/**
	 * 유저클래스 찾기
	 * @param {{ discordId?: string, nickname?: string }} userInfo
	 */
	getUser({ discordId, nickname }) {
		if (discordId) {
			return Game.userList.find(userInfo => userInfo.getId() === discordId);
		}
		return Game.userList.find(userInfo => userInfo.nickname === nickname);
	}

	getUserList() {
		return Game.userList;
	}

	updateGrantMoney() {
		this.grantMoney += 210 + this.grantMoney * 0.02;
		if (this.grantMoney > 5_000_000) {
			this.grantMoney = 5_000_000;
		}
	}
}
