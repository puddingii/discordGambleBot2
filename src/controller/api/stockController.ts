import { Request, Response } from 'express';
import stockModel from '../../model/Stock';

export const getStockInfo = async (req: Request, res: Response) => {
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
		const stockInfo = await stockModel.findOne({ name }, 'comment dividend type value ');
		if (!stockInfo) {
			throw Error('이름에 해당하는 주식정보가 없습니다.');
		}
		return res.status(200).json(stockInfo);
	} catch (err) {
		let message = err;
		if (err instanceof Error) {
			message = err.message;
		}
		return res.status(400).json({ message });
	}
};

export default { getStockInfo };
