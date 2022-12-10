import express from 'express';
import { getUserInfo } from '../controller/api/userController';
import { isLoggedIn } from '../middlewares/express';

const router = express.Router();

router.get('/', isLoggedIn, getUserInfo);

export default router;
