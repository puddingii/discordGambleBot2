import express from 'express';
import { getStockInfo } from '../controller/api/stockController';
import { isLoggedIn } from '../middlewares/express';

const router = express.Router();

router.get('/', isLoggedIn, getStockInfo);

export default router;
