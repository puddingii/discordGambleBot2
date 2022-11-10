import { ClientSession } from 'mongoose';
import dependency from '../../config/dependencyInjection';

const {
	cradle: { StatusModel },
} = dependency;

type UpdateTypeInfo = 't' | 'g';
type UpdateParamInfo = {
	type: UpdateTypeInfo;
	// updateParam: Partial<{ num: number }>;
};

export default class GlobalManager {
	curTime: number;
	grantMoney: number;

	constructor({ grantMoney, curTime }: { grantMoney?: number; curTime?: number }) {
		this.grantMoney = grantMoney ?? 0;
		this.curTime = curTime ?? 0;
	}

	/** 현재 시간 업데이트 */
	updateCurTime(num: number) {
		this.curTime = num;
	}

	/** 보조금 업데이트 */
	updateGrantMoney(num?: number) {
		if (num === 0 || num) {
			this.grantMoney = num;
			return;
		}
		this.grantMoney += 210 + this.grantMoney * 0.02;
		if (this.grantMoney > 5_000_000) {
			this.grantMoney = 5_000_000;
		}
	}

	async update(updateInfo: UpdateParamInfo, session: ClientSession | null = null) {
		const { type } = updateInfo;
		switch (type) {
			case 't':
				await StatusModel.updateStatus({ gamble: { curTime: this.curTime } });
				break;
			case 'g':
				await StatusModel.updateStatus(
					{ user: { grantMoney: this.grantMoney } },
					session,
				);
				break;
			default:
		}
	}
}
