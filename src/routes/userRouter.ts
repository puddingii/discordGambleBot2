import express from 'express';
import {
	getUserInfo,
	getUserStockList,
	patchUserStock,
} from '../controller/api/userController';
import { isLoggedIn } from '../middlewares/express';

const router = express.Router();

router.get('/stocklist', isLoggedIn, getUserStockList);
router.patch('/stock', isLoggedIn, patchUserStock);
router.get('/', isLoggedIn, getUserInfo);

export default router;
