import express from 'express';
import { isLoggedIn } from '../middlewares/express';
import stockController from '../controller/stockController';

const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
	/*
	#swagger.parameters['name'] = {
		in: 'query',
		description: '주식이름',
		required: true,
		type: 'string'
	}
	*/
	const {
		query: { name },
	} = req;
	try {
		const stock = await stockController.getStock(name as string);
		return res.status(200).json({
			comment: stock.comment,
			dividend: stock.dividend,
			type: stock.type,
			value: stock.value,
		});
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
});

export default router;
