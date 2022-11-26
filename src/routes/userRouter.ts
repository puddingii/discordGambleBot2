import express from 'express';
import { postLogin } from '../controller/api/userController';

const router = express.Router();

router.post('/login', postLogin);

export default router;
