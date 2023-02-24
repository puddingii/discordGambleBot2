import { inject, injectable } from 'inversify';
import TYPES from '../interfaces/containerType';
import Weapon from '../game/Weapon/Weapon';
import {
	IWeaponService,
	TEnhanceSimulateResult,
	ValueOf,
} from '../interfaces/services/weaponService';
import { IWeapon, TWeaponConstructor, TWeaponInfo } from '../interfaces/game/weapon';

@injectable()
class WeaponService implements IWeaponService {
	formatter: IWeaponService['formatter'];
	weaponModel: IWeaponService['weaponModel'];

	constructor(
		@inject(TYPES.WeaponModel) weaponModel: IWeaponService['weaponModel'],
		@inject(TYPES.Formatter) formatter: IWeaponService['formatter'],
	) {
		this.weaponModel = weaponModel;
		this.formatter = formatter;
	}

	getCost(
		weapon: IWeapon,
		exponent: number,
		option?: { isPreventDown?: boolean; isPreventDestroy?: boolean },
	): number {
		let cost = this.getDefaultCost(weapon, exponent);
		if (option) {
			const { isPreventDestroy, isPreventDown } = option;
			cost += (isPreventDestroy ? cost * 2 : 0) + (isPreventDown ? cost * 10 : 0);
		}

		return cost;
	}

	private getDefaultCost(weapon: IWeapon, exponent: number) {
		return (weapon.baseMoney ** (exponent - 10) + 1) * weapon.enhanceCost;
	}

	getEnhanceInfo(weapon: IWeapon, power: number) {
		const ratio = weapon.ratioList[power];
		const successRatio = 1 - (ratio.destroyRatio + ratio.failRatio);
		return {
			success: successRatio,
			fail: ratio.failRatio,
			destroy: ratio.destroyRatio,
			cost: this.getDefaultCost(weapon, power),
		};
	}

	getPower(weapon: IWeapon, power: number): number {
		if (power < 0 && power > weapon.maxPower) {
			throw Error('0미만 및 강화 최대치 초과의 힘은 책정할 수 없습니다');
		}

		return weapon.powerMultiple * power;
	}

	simulateWeaponEnhance(weapon: IWeapon, power: number): TEnhanceSimulateResult {
		if (!weapon.isValidPower(power + 1)) {
			throw Error('더이상 강화할 수 없습니다');
		}
		const { fail, destroy, cost } = this.getEnhanceInfo(weapon, power);
		const MAX_NUMBER = 1000;
		const randomNum = this.formatter.getRandomNumber(MAX_NUMBER, 1);
		// 실패
		if (fail * MAX_NUMBER >= randomNum) {
			return { code: 2, cost };
		}
		// 터짐
		if ((fail + destroy) * MAX_NUMBER >= randomNum) {
			return { code: 3, cost };
		}

		// 성공
		return {
			code: 1,
			cost,
		};
	}

	async addWeapon(param: TWeaponConstructor) {
		const weaponInfo = await this.weaponModel.addWeapon(param);
		const weapon = new Weapon({
			baseMoney: weaponInfo.baseMoney,
			enhanceCost: weaponInfo.enhanceCost,
			maxPower: weaponInfo.enhanceCost,
			name: weaponInfo.name,
			powerMultiple: weaponInfo.powerMultiple,
			ratioList: weaponInfo.ratioList,
			type: weaponInfo.type,
			comment: weaponInfo.comment,
		});

		return weapon;
	}

	async getAllWeapon() {
		const weaponList = await this.weaponModel.find();

		return weaponList.map(
			weapon =>
				new Weapon({
					baseMoney: weapon.baseMoney,
					enhanceCost: weapon.enhanceCost,
					maxPower: weapon.enhanceCost,
					name: weapon.name,
					powerMultiple: weapon.powerMultiple,
					ratioList: weapon.ratioList,
					type: weapon.type,
					comment: weapon.comment,
				}),
		);
	}

	async getWeapon(type: string) {
		const weapon = await this.weaponModel.findOne({ type });
		if (!weapon) {
			throw Error('해당하는 무기가 없습니다');
		}

		return new Weapon({
			baseMoney: weapon.baseMoney,
			enhanceCost: weapon.enhanceCost,
			maxPower: weapon.enhanceCost,
			name: weapon.name,
			powerMultiple: weapon.powerMultiple,
			ratioList: weapon.ratioList,
			type: weapon.type,
			comment: weapon.comment,
		});
	}

	async updateWeapon(weapon: IWeapon, param: Partial<TWeaponInfo>) {
		/** FIXME 각 파람값들이 유효한지 테스트하는것이 필요 */
		(Object.keys(param) as Array<keyof typeof param>).forEach(info => {
			if (info !== 'type' && info !== 'name') {
				(<ValueOf<IWeapon>>weapon[info]) = <keyof typeof param>param[info];
			}
		});

		await this.weaponModel.updateWeapon(weapon);
	}
}

export default WeaponService;
