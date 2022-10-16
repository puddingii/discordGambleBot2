import { Types } from 'mongoose';
import dependencyInjection from '../config/dependencyInjection';
import DataManager from '../game/DataManager';
import Stock from '../game/Stock/Stock';
import Coin from '../game/Stock/Coin';
import User from '../game/User/User';
import Sword from '../game/Weapon/Sword';
import StockManager from '../game/Stock/StockManager';
import UserManager from '../game/User/UserManager';
import WeaponManager from '../game/Weapon/WeaponManager';
import GlobalManager from '../game/Status/GlobalManager';
import stockController from '../controller/stockController';

const {
	cradle: { UserModel, StockModel, StatusModel, secretKey },
} = dependencyInjection;

const dataManager = DataManager.getInstance();

export default async () => {
	const stockAllList = await StockModel.findAllList('all');

	const { stockList, coinList } = stockAllList.reduce(
		(acc: { stockList: Stock[]; coinList: Coin[] }, cur) => {
			if (cur.type === 'stock') {
				const stock = new Stock({
					ratio: { min: cur.minRatio, max: cur.maxRatio },
					name: cur._doc.name,
					comment: cur._doc.comment,
					type: 'stock',
					updateTime: cur._doc.updateTime,
					conditionList: cur._doc.conditionList,
					correctionCnt: cur._doc.correctionCnt,
					dividend: cur._doc.dividend,
					value: cur._doc.value,
				});
				acc.stockList.push(stock);
			} else {
				const coin = new Coin({
					ratio: { min: cur.minRatio, max: cur.maxRatio },
					name: cur._doc.name,
					comment: cur._doc.comment,
					type: 'coin',
					updateTime: cur._doc.updateTime,
					correctionCnt: cur._doc.correctionCnt,
					value: cur._doc.value,
				});
				acc.coinList.push(coin);
			}
			return acc;
		},
		{ stockList: [], coinList: [] },
	);

	const userDBList = await UserModel.find({}).populate('stockList.stock');
	const userList: User[] = userDBList.map(user => {
		/** stock정보에 해당하는 class 불러와서 init */
		const myStockList = user.stockList.reduce(
			(acc: { stock: Stock | Coin; cnt: number; value: number }[], stockInfo) => {
				if (stockInfo.stock instanceof Types.ObjectId) {
					return acc;
				}
				const { stock, cnt, value } = stockInfo;
				const list: Array<Stock | Coin> = stock.type === 'stock' ? stockList : coinList;
				const myStock = list.find(controllerStock => controllerStock.name === stock.name);
				if (myStock) {
					acc.push({ stock: myStock, cnt, value });
				}
				return acc;
			},
			[],
		);

		const weaponList = user.weaponList.map(weapon => {
			return new Sword({
				bonusPower: weapon.bonusPower,
				hitRatio: weapon.hitRatio,
				missRatio: weapon.missRatio,
				curPower: weapon.curPower,
				destroyCnt: weapon.destroyCnt,
				failCnt: weapon.failCnt,
				successCnt: weapon.successCnt,
			});
		});

		return new User({
			id: user.discordId,
			nickname: user.nickname,
			money: user.money,
			stockList: myStockList,
			weaponList,
		});
	});

	const {
		user: { grantMoney },
		gamble: { curTime, curCondition, conditionPeriod, conditionRatioPerList },
	} = await StatusModel.getStatus();

	dataManager.set('globalStatus', new GlobalManager({ curTime, grantMoney }));
	dataManager.set(
		'stock',
		new StockManager({
			coinList,
			stockList,
			conditionPeriod,
			conditionRatioPerList,
			curCondition,
		}),
	);
	dataManager.set('user', new UserManager(userList));
	dataManager.set('weapon', new WeaponManager());

	setInterval(() => {
		// FIXME node-scheduler
		/** 12시간마다 컨디션 조정 */
		const globalManager = dataManager.get('globalStatus');
		const stockManager = dataManager.get('stock');
		stockManager.updateCondition(globalManager.curTime);
		globalManager.curTime++;
		globalManager.updateGrantMoney();
		const { stockList, userList } = stockController.update(globalManager.curTime);
		stockList.length && StockModel.updateStockList(stockList);
		userList.length && UserModel.updateMoney(userList);
	}, 1000 * secretKey.gambleUpdateTime); // 맨 뒤의 값이 분단위임
};
