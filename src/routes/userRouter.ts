import express from 'express';
import {
	getUserProfileInfo,
	getUserStockList,
	patchUserStock,
} from '../controller/api/userController';
import { isLoggedIn } from '../middlewares/express';

const router = express.Router();

router.get('/stocklist', isLoggedIn, getUserStockList);
router.patch('/stock', isLoggedIn, patchUserStock);
router.get('/', isLoggedIn, getUserProfileInfo);

export default router;
