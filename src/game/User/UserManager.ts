import User from './User';

export default class UserManager {
	userList: Array<User>;
	waitingList: Set<User> = new Set();

	constructor(userList: Array<User>) {
		this.userList = userList;
	}

	/** 유저등록 */
	addUser(userInfo: { id: string; nickname: string }) {
		const isExistUser = this.getUser({ discordId: userInfo.id });
		if (isExistUser) {
			throw Error('이미 있는 유저입니다.');
		}
		const user = new User(userInfo);
		this.userList.push(user);
	}

	/** 내가 가지고 있는 무기 반환 */
	getMyWeapon({ discordId, type }: { discordId: string; type: 'sword' }) {
		const user = this.getUser({ discordId });
		if (!user) {
			throw Error('유저정보를 찾을 수 없습니다.');
		}

		return user.getWeapon(type);
	}

	/** 디스코드 아이디를 가지고 유저클래스 찾기 */
	getUser({
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

	/** 유저리스트 가져오기 */
	getUserList(): Array<User> {
		return this.userList;
	}

	/** DB업데이트를 기다리고 있는 리스트들 다 가져오고 빈 배열로 만든다. */
	popAllWaitingList(): Array<User> {
		const myList = [...this.waitingList];
		this.waitingList.clear();
		return myList;
	}

	/** DB업데이트 목록에 유저정보 추가 */
	pushWaitingUser(userInfo: User | Array<User>) {
		if (Array.isArray(userInfo)) {
			userInfo.forEach(userClass => {
				if (userClass instanceof User) {
					this.waitingList.add(userClass);
				}
			});
			return;
		}
		this.waitingList.add(userInfo);
	}
}
