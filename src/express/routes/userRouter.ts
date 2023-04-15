import express from 'express';
import { Types } from 'mongoose';
import TYPES from '../../interfaces/containerType';
import { container } from '../../settings/container';
import { isLoggedIn } from '../middlewares/express';
import { IStatusController } from '../../interfaces/common/controller/status';
import { IUserController } from '../../interfaces/common/controller/user';
import { IUserStockController } from '../../interfaces/common/controller/userStock';

const router = express.Router();
const statusController = container.get<IStatusController>(TYPES.StatusController);
const userController = container.get<IUserController>(TYPES.UserController);
const userStockController = container.get<IUserStockController>(
	TYPES.UserStockController,
);

router.get('/stocklist', isLoggedIn, async (req, res) => {
	try {
		/*
		#swagger.tags = ['User', 'Stock']
		#swagger.description = '유저가 가지고 있는 모든 주식정보 반환'
		*/
		const discordId = req.user;
		if (!discordId) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}
		const myStockList = await userController.getMyStockList(discordId);
		return res.status(200).json(myStockList);
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
});

router.get('/summary', isLoggedIn, async (req, res) => {
	try {
		/*
		#swagger.tags = ['User', 'Stock', 'Weapon']
		#swagger.description = '대시보드에 보여줄 종합 내용'
		*/
		const discordId = req.user;
		if (!discordId) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}
		const summaryInfo = await userController.getUserSummary(discordId);
		return res.status(200).json(summaryInfo);
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
		/*
		#swagger.tags = ['User']
		#swagger.description = '게임에 참여하고 있는 모든 유저리스트 반환'
		*/
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
		/*
		#swagger.tags = ['User', 'Weapon']
		#swagger.description = '유저가 가지고 있는 모든 무기 반환'
		*/
		const discordId = req.user;
		if (!discordId) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}
		const weaponList = await userController.getMyWeaponList(discordId);

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

router.patch('/give-money', isLoggedIn, async (req, res) => {
	try {
		/*
		#swagger.tags = ['User']
		#swagger.description = '다른 유저에게 돈 기부하는 기능'
		#swagger.parameters['giveInfo'] = {
			in: 'body',
			description: '건빵이 건빵테스트에게 1000원 주는 기능',
			required: true,
			schema: {
				$myNickname: '건빵',
				$ptrNickname: '건빵테스트',
				$money: 1000,
			}
		}
		*/
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
		/*
		#swagger.tags = ['User','Stock']
		#swagger.description = '이름에 해당하는 주식 사고팔기'
		#swagger.parameters['tradeStockInfo'] = {
			in: 'body',
			description: 'b=사기, s=팔기',
			required: true,
			schema: {
				$type: 'b',
				$cnt: 1,
				$stockName: '응애',
			}
		}
		*/
		const { user: discordId } = req;
		const { cnt, stockName, type } = req.body as Partial<{
			type: 'b' | 's';
			cnt: number;
			stockName: string;
		}>;
		if (!discordId) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}
		if (!cnt || !stockName || !type) {
			throw Error('데이터 오류');
		}

		const stockResult = await userStockController.tradeStock({
			discordId,
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
		/*
		#swagger.tags = ['User']
		#swagger.description = '계속 쌓이는 보조금 받기(일정 시간마다 돈이 쌓임)'
		*/
		const { user: discordId } = req;
		if (!discordId) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}

		const money = await userController.giveGrantMoney(discordId);

		return res.status(200).json({ value: money });
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
});

router.patch('/giftMoney', isLoggedIn, async (req, res) => {
	try {
		/*
		#swagger.tags = ['User']
		#swagger.description = '선물받은 캐쉬 받기'
		*/
		const { user: discordId } = req;
		if (!discordId) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}

		await userController.receiveAllGiftMoney(discordId);

		return res.status(200).send();
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
		/*
		#swagger.tags = ['User']
		#swagger.description = '유저정보 반환.(가지고 있는 주식, 닉네임, 돈 등등)'
		*/
		const { user: discordId } = req;
		if (!discordId) {
			return res
				.status(401)
				.json({ message: '유저정보가 없습니다. 다시 로그인 해주세요.' });
		}
		const userInfo = await userController.getUserProfile(discordId);

		const grantMoney = await statusController.getGrantMoney();

		return res.status(200).json({ ...userInfo, grantMoney });
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
});

export default router;
