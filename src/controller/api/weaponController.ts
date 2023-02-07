import { Request, Response } from 'express';
import DataManager from '../../game/DataManager';

const dataManager = DataManager.getInstance();

/** 무기강화 할때의 정보 가져오기 */
export const getEnhanceInfo = (req: Request, res: Response) => {
	try {
		/*
		#swagger.parameters['type'] = {
			in: 'query',
			description: '무기타입',
			required: true,
			type: 'string'
		}
		*/
		const {
			query: { type },
		} = req;
		const { user } = req;
		if (!user) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}

		const userManager = dataManager.get('user');
		const userInfo = userManager.getUser({ discordId: user.discordId });
		if (!userInfo) {
			throw Error('유저정보가 없습니다');
		}

		const myWeapon = userInfo?.getWeapon(<string>type);
		if (!myWeapon) {
			throw Error('무기정보가 없습니다.');
		}

		const cost = myWeapon.weapon.getCost(myWeapon.curPower);
		const ratioInfo = myWeapon.weapon.ratioList[myWeapon.curPower];
		return res.status(200).json({
			cost,
			successRatio: 1 - (ratioInfo.failRatio + ratioInfo.destroyRatio),
			failRatio: ratioInfo.failRatio,
			destroyRatio: ratioInfo.destroyRatio,
		});
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
};

export default {
	getEnhanceInfo,
};
