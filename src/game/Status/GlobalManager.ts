export default class GlobalManager {
	curTime: number;
	grantMoney: number;

	constructor({ grantMoney, curTime }: { grantMoney?: number; curTime?: number }) {
		this.grantMoney = grantMoney ?? 0;
		this.curTime = curTime ?? 0;
	}

	/** 보조금 업데이트 */
	updateGrantMoney() {
		this.grantMoney += 210 + this.grantMoney * 0.02;
		if (this.grantMoney > 5_000_000) {
			this.grantMoney = 5_000_000;
		}
	}
}
