export default class WeaponManager {
	private swordInfo: {
		ratioList: { moneyRatio: number; failRatio: number; destroyRatio: number }[];
		value: number;
	};

	constructor() {
		const section1 = Array.from({ length: 10 }, (v, i) => ({
			moneyRatio: 1.1,
			failRatio: 0.05 * i,
			destroyRatio: 0,
		}));
		this.swordInfo = {
			ratioList: [
				...section1,
				{ moneyRatio: 1.15, failRatio: 0.5, destroyRatio: 0 }, // 10 -> 11
				{ moneyRatio: 1.15, failRatio: 0.55, destroyRatio: 0 },
				{ moneyRatio: 1.15, failRatio: 0.6, destroyRatio: 0.006 },
				{ moneyRatio: 1.15, failRatio: 0.6, destroyRatio: 0.013 },
				{ moneyRatio: 1.15, failRatio: 0.65, destroyRatio: 0.014 }, // 14 -> 15
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.02 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.03 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.04 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.05 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.05 }, // 19 -> 20
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.06 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.07 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.08 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.09 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.1 }, // 24 -> 25
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.11 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.12 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.13 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.14 },
				{ moneyRatio: 1.2, failRatio: 0.7, destroyRatio: 0.15 }, // 29 -> 30
			],
			value: 3000,
		};
	}

	getDefaultValue(type: 'sword') {
		return this[`${type}Info`].value;
	}

	getInfo(type: 'sword') {
		return this[`${type}Info`];
	}

	/** 다음 강화할 때 확률 */
	getNextRatio({ type, curPower }: { type: 'sword'; curPower: number }) {
		const ratioList = this[`${type}Info`].ratioList;
		if (curPower >= ratioList.length) {
			throw Error('더이상 강화할 수 없습니다.');
		}
		const ratio = ratioList[curPower];
		return {
			success: 1 - (ratio.destroyRatio + ratio.failRatio),
			fail: ratio.failRatio,
			destroy: ratio.destroyRatio,
		};
	}

	getRatioList(type: 'sword') {
		return this[`${type}Info`].ratioList;
	}
}
