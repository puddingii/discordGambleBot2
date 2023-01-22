import express from 'express';
import {
	getUserList,
	getUserProfileInfo,
	getUserStockList,
	patchGrantMoney,
	patchUserStock,
} from '../controller/api/userController';
import { isLoggedIn } from '../middlewares/express';

const router = express.Router();

router.get('/stocklist', isLoggedIn, getUserStockList);
router.get('/list', isLoggedIn, getUserList);
router.patch('/stock', isLoggedIn, patchUserStock);
router.patch('/grantmoney', isLoggedIn, patchGrantMoney);
router.get('/', isLoggedIn, getUserProfileInfo);

export default router;
