import { inject, injectable } from 'inversify';
import { IUserWeaponController } from '../../interfaces/common/controller/userWeapon';
import { TWeaponConstructor } from '../../interfaces/game/weapon';
import TYPES from '../../interfaces/containerType';

@injectable()
export default class UserWeaponController implements IUserWeaponController {
	userService: IUserWeaponController['userService'];
	weaponService: IUserWeaponController['weaponService'];

	constructor(
		@inject(TYPES.UserService) userService: IUserWeaponController['userService'],
		@inject(TYPES.WeaponService) weaponService: IUserWeaponController['weaponService'],
	) {
		this.userService = userService;
		this.weaponService = weaponService;
	}

	async addWeaponAndUpdateUsers(param: TWeaponConstructor): Promise<void> {
		const weapon = await this.weaponService.addWeapon(param);
		await this.userService.addWeapon(weapon);
	}

	async enhanceWeapon({
		discordId,
		type,
		isPreventDestroy,
		isPreventDown,
	}: {
		discordId: string;
		type: string;
		isPreventDestroy: boolean;
		isPreventDown: boolean;
	}): Promise<{ code: 1 | 2 | 3; curPower: number; beforePower: number }> {
		const user = await this.userService.getUser({ discordId }, ['weaponList.weapon']);
		const myWeapon = user.getWeapon(type);
		if (!myWeapon) {
			throw Error('해당 무기를 가지고있지 않습니다');
		}

		const beforePower = myWeapon.curPower;
		const enhanceResult = this.weaponService.simulateWeaponEnhance(
			myWeapon.weapon,
			myWeapon.curPower,
		);
		await this.userService.updateWeaponAndUserMoney(user, myWeapon, enhanceResult, {
			isPreventDestroy,
			isPreventDown,
		});

		return { code: enhanceResult.code, curPower: myWeapon.curPower, beforePower };
	}

	async getMyWeaponEnhanceInfo(
		discordId: string,
		type: string,
	): Promise<{ success: number; fail: number; destroy: number; cost: number }> {
		const user = await this.userService.getUser({ discordId }, ['weaponList.weapon']);
		const myWeapon = user.getWeapon(type);
		if (!myWeapon) {
			throw Error('해당하는 무기를 가지고 있지 않습니다');
		}
		const enhanceInfo = this.weaponService.getEnhanceInfo(
			myWeapon.weapon,
			myWeapon.curPower,
		);
		return enhanceInfo;
	}
}
