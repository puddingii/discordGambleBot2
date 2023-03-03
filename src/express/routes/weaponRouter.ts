import express from 'express';
import { isLoggedIn } from '../middlewares/express';
import TYPES from '../../interfaces/containerType';
import { container } from '../../settings/container';
import { IUserWeaponController } from '../../interfaces/common/controller/userWeapon';

const router = express.Router();
const userWeaponController = container.get<IUserWeaponController>(
	TYPES.UserWeaponController,
);

router.get('/enhance', isLoggedIn, async (req, res) => {
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

		const { cost, destroy, fail, success } =
			await userWeaponController.getMyWeaponEnhanceInfo(user.discordId, type as string);

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