import { Request, Response } from 'express';
import DataManager from '../../game/DataManager';

const dataManager = DataManager.getInstance();

/** 모든 무기 다 가져오기 */
export const getAllWeapon = (req: Request, res: Response) => {
	const weaponManager = dataManager.get('weapon');
	return weaponManager.weaponList;
};

export default {
	getAllWeapon,
};
