import express from 'express';
import {
	getNicknameList,
	getUserProfileInfo,
	getUserStockList,
	patchGiveMoney,
	patchGrantMoney,
	patchUserStock,
} from '../controller/api/userController';
import { isLoggedIn } from '../middlewares/express';

const router = express.Router();

router.get('/stocklist', isLoggedIn, getUserStockList);
router.get('/nicklist', isLoggedIn, getNicknameList);
router.patch('/give/money', isLoggedIn, patchGiveMoney);
router.patch('/stock', isLoggedIn, patchUserStock);
router.patch('/grantmoney', isLoggedIn, patchGrantMoney);
router.get('/', isLoggedIn, getUserProfileInfo);

export default router;
