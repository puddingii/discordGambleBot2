type TRatioType = { failRatio: number; destroyRatio: number };

export type TWeaponInfo = {
	type: string;
	name: string;
	comment: string;
	powerMultiple: number;
	enhanceCost: number;
	baseMoney: number;
	ratioList: Array<TRatioType>;
	maxPower: number;
};

export interface IWeapon extends TWeaponInfo {
	/** 강화확률 반환 */
	getRatio(power: number): TRatioType;
	/** Power값 유효한지 */
	isValidPower(power: number): boolean;
}

export type TWeaponConstructor = Omit<TWeaponInfo, 'comment'> &
	Pick<Partial<TWeaponInfo>, 'comment'>;
