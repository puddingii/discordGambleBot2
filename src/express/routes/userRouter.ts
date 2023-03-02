import express from 'express';
import { Types } from 'mongoose';
import userController from '../../controller/userController';
import statusController from '../../controller/statusController';
import { isLoggedIn } from '../../middlewares/express';

const router = express.Router();

router.get('/stocklist', isLoggedIn, async (req, res) => {
	try {
		const user = req.user;
		if (!user) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}
		const myStockList = await userController.getMyStockList(user.discordId);
		return res.status(200).json(myStockList);
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
});
router.get('/nicklist', isLoggedIn, async (req, res) => {
	try {
		const userList = await userController.getUserList();
		return res.status(200).json(userList.map(user => user.nickname));
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
});
router.get('/weaponList', isLoggedIn, async (req, res) => {
	try {
		const user = req.user;
		if (!user) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}
		const weaponList = await userController.getMyWeaponList(user.discordId);

		const myWeaponList = weaponList.map(myWeapon => {
			if (myWeapon.weapon instanceof Types.ObjectId) {
				throw Error('Populated Error. 운영자에게 문의주세요');
			}
			return {
				bonusPower: myWeapon.bonusPower,
				curPower: myWeapon.curPower,
				destroyCnt: myWeapon.destroyCnt,
				failCnt: myWeapon.failCnt,
				hitRatio: myWeapon.hitRatio,
				missRatio: myWeapon.missRatio,
				successCnt: myWeapon.successCnt,
				name: myWeapon.weapon.name,
				type: myWeapon.weapon.type,
				comment: myWeapon.weapon.comment,
			};
		});

		return res.status(200).json(myWeaponList);
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
});
router.patch('/give/money', isLoggedIn, async (req, res) => {
	try {
		const { user } = req;
		const { myNickname, ptrNickname, money } = req.body as Partial<{
			myNickname: string;
			ptrNickname: string;
			money: number;
		}>;
		if (!user) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}

		if (!myNickname || !ptrNickname || !money) {
			throw Error('처리에 필요한 데이터가 부족합니다.');
		}
		await userController.giveMoney(
			{ nickname: myNickname },
			{ nickname: ptrNickname },
			money,
		);

		return res.status(200).json(null);
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
});
router.patch('/stock', isLoggedIn, async (req, res) => {
	try {
		const { user } = req;
		const { cnt, stockName, type } = req.body as Partial<{
			type: 'b' | 's';
			cnt: number;
			stockName: string;
		}>;
		if (!user) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}
		if (!cnt || !stockName || !type) {
			throw Error('데이터 오류');
		}

		const stockResult = await userController.tradeStock({
			discordId: user.discordId,
			stockName,
			cnt: type === 's' ? -1 * cnt : cnt,
			isFull: false,
		});

		return res.status(200).json({ cnt: stockResult.cnt, value: stockResult.value });
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
});
router.patch('/grantmoney', isLoggedIn, async (req, res) => {
	try {
		const { user } = req;
		if (!user) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}

		const money = await userController.giveGrantMoney(user.discordId);

		return res.status(200).json({ value: money });
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
});
router.get('/', isLoggedIn, async (req, res) => {
	try {
		const { user } = req;
		if (!user) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}
		const userInfo = await userController.getUser({ discordId: user.discordId }, [
			'stockList.stock',
		]);

		const totalStockValue = userInfo.stockList.reduce((acc, myStock) => {
			if (myStock.stock instanceof Types.ObjectId) {
				throw Error('Populated Error. 운영자에게 문의주세요');
			}
			const stockInfo = myStock.stock;
			const { cnt } = myStock;

			if (cnt > 0) {
				// 내가 가지고 있는 주식 갯수로 평균 매수위치 알기(내 평균값, 주식값)
				acc += cnt * stockInfo.value;
			}

			return acc;
		}, 0);
		const grantMoney = await statusController.getGrantMoney();

		return res.status(200).json({
			nickname: user.nickname,
			totalStockValue,
			myMoney: user.money,
			grantMoney,
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
