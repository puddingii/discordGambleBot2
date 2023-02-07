import express from 'express';
import { getEnhanceInfo } from '../controller/api/weaponController';
import { isLoggedIn } from '../middlewares/express';

const router = express.Router();

router.get('/enhance', isLoggedIn, getEnhanceInfo);

export default router;
