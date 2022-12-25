import express from 'express';
import { getLoginInfo, postLogin, postLogout } from '../controller/api/authController';
import { isLoggedIn, isNotLoggedIn } from '../middlewares/express';

const router = express.Router();

router.get('/is-login', getLoginInfo);
router.post('/', isNotLoggedIn, postLogin);
router.delete('/', isLoggedIn, postLogout);

export default router;
