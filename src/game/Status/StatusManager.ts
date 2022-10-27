import dependency from '../../config/dependencyInjection';

const {
	cradle: { StatusModel },
} = dependency;

export default class GlobalManager {
	curTime: number;
	grantMoney: number;

	constructor({ grantMoney, curTime }: { grantMoney?: number; curTime?: number }) {
		this.grantMoney = grantMoney ?? 0;
		this.curTime = curTime ?? 0;
	}

	/** 현재 시간 업데이트 */
	async updateCurTime(num?: number) {
		if (num === 0 || num) {
			this.curTime = num;
		} else {
			this.curTime += 1;
		}
		await StatusModel.updateStatus({ gamble: { curTime: this.curTime } });
	}

	/** 보조금 업데이트 */
	async updateGrantMoney(num?: number) {
		if (num === 0 || num) {
			this.grantMoney = 0;
		} else {
			this.grantMoney += 210 + this.grantMoney * 0.02;
			if (this.grantMoney > 5_000_000) {
				this.grantMoney = 5_000_000;
			}
		}
		await StatusModel.updateStatus({ user: { grantMoney: this.grantMoney } });
	}
}
