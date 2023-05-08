import express from 'express';
import { isLoggedIn } from '../middlewares/express';
import TYPES from '../../interfaces/containerType';
import { container } from '../../settings/container';
import { IUserWeaponController } from '../../interfaces/common/controller/userWeapon';

const router = express.Router();
const userWeaponController = container.get<IUserWeaponController>(
	TYPES.UserWeaponController,
);

router.get('/enhance-info', isLoggedIn, async (req, res) => {
	try {
		/*
		#swagger.tags = ['Weapon']
		#swagger.description = '무기강화에 대한 정보'
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
		const { user: discordId } = req;
		if (!discordId) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}

		const { cost, destroy, fail, success } =
			await userWeaponController.getMyWeaponEnhanceInfo(discordId, <string>type);

		return res.status(200).json({
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
