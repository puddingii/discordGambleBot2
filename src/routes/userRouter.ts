import express from 'express';
import { postLogin } from '../controller/api/userController';
import { isLoggedIn } from '../middlewares/express';

const router = express.Router();

router.post('/login', postLogin);
router.post('/logout', isLoggedIn, (req, res) => {
	console.log('hi');
	return res.send('hi');
});

export default router;
