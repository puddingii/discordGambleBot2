import User from '../game/User/User';
import Stock from '../game/Stock/Stock';
import Coin from '../game/Stock/Coin';
import DataManager from '../game/DataManager';

const dataManager = DataManager.getInstance();
const userManager = dataManager.get('user');
const stockManager = dataManager.get('stock');

export const buySellStock = ({
	discordId,
	stockName,
	cnt,
	isFull,
}: {
	discordId: string;
	stockName: string;
	cnt: number;
	isFull: boolean;
}): { cnt: number; value: number; money: number } => {
	const userInfo = userManager.getUser({ discordId });
	if (!userInfo) {
		throw Error('유저정보가 없습니다');
	}

	const stockInfo = stockManager.getStock('', stockName);
	if (!stockInfo) {
		throw Error('주식/코인정보가 없습니다');
	}

	const stockResult = userInfo.updateStock(stockInfo, cnt, isFull);
	return stockResult;
};

/** 돈 갱신 */
export const updateMoney = (discordId: string, value: number): User => {
	const userInfo = userManager.getUser({ discordId });
	if (!userInfo) {
		throw Error('유저정보가 없습니다');
	}
	userInfo.updateMoney(value);
	return userInfo;
};

/** 주식정보 갱신 및 배당금 지급 */
export const update = (): { stockList: Array<Stock | Coin>; userList: User[] } => {
	// 이쪽 아래로 StockManager.update() 호출후 업데이트된 주
	const { stockList, coinList } = stockManager.update();
	const userList = userManager.getUserList();
	let updUserList: User[] = [];

	// 주식 배당금 시간값 가져와서
	if (stockManager.curTime % 48 === 0) {
		updUserList = userList.filter(user => {
			const result = user.giveDividend();
			return !!result.code;
		});
	}

	return { stockList: [...stockList, ...coinList], userList: updUserList };
};

export default {
	buySellStock,
	updateMoney,
	update,
};
