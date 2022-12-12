import express from 'express';
import { getUserInfo, getUserStockList } from '../controller/api/userController';
import { isLoggedIn } from '../middlewares/express';

const router = express.Router();

router.get('/stocklist', isLoggedIn, getUserStockList);
router.get('/', isLoggedIn, getUserInfo);

export default router;
