import express from 'express';
import { isLoggedIn } from '../middlewares/express';
import TYPES from '../../interfaces/containerType';
import { container } from '../../settings/container';
import { IUserWeaponController } from '../../interfaces/common/controller/userWeapon';

const router = express.Router();
const userWeaponController = container.get<IUserWeaponController>(
	TYPES.UserWeaponController,
);

router.patch('/enhance', isLoggedIn, async (req, res) => {
	try {
		/*
		#swagger.tags = ['User','Weapon']
		#swagger.description = '타입에 해당하는 무기 강화하기'
		#swagger.parameters['weaponInfo'] = {
			in: 'body',
			description: '무기강화',
			required: true,
			schema: {
				$type: 'sword',
			}
		}
		*/
		const { user: discordId } = req;
		const { type } = req.body as Partial<{
			type: string;
		}>;
		if (!discordId) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}
		if (!type) {
			throw Error('처리에 필요한 데이터가 부족합니다.');
		}

		const enhanceResult = await userWeaponController.enhanceWeapon({
			discordId,
			isPreventDestroy: false,
			isPreventDown: false,
			type,
		});

		const { cost, destroy, fail, success } =
			await userWeaponController.getMyWeaponEnhanceInfo(discordId, <string>type);

		return res.status(200).json({
			enhanceResult,
			cost,
			successRatio: success,
			failRatio: fail,
			destroyRatio: destroy,
		});
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
});

export default router;
