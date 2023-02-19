import { Types } from 'mongoose';
import DataManager from '../game/DataManager';
import Stock from '../game/Stock/Stock';
import Coin from '../game/Stock/Coin';
import User from '../game/User/User';
import Weapon from '../game/Weapon/Weapon';
import StockManager from '../game/Stock/StockManager';
import UserManager from '../game/User/UserManager';
import WeaponManager from '../game/Weapon/WeaponManager';
import GlobalManager from '../game/Status/StatusManager';
import StatusModel from '../model/Status';
import UserModel from '../model/User';
import StockModel from '../model/Stock';
import WeaponModel from '../model/Weapon';
import { TUserWeaponInfo, TUserStockInfo } from '../interfaces/game/user';

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

	const weaponAllList = (await WeaponModel.findAllList()).map(weapon => {
		const {
			type,
			name,
			comment,
			powerMultiple,
			enhanceCost,
			baseMoney,
			ratioList,
			maxPower,
		} = weapon._doc;
		const myWeapon = new Weapon({
			type,
			name,
			comment,
			powerMultiple,
			enhanceCost,
			baseMoney,
			ratioList,
			maxPower,
		});
		return myWeapon;
	});

	const userDBList = await UserModel.find({}).populate(
		'stockList.stock weaponList.weapon',
	);
	const userList: User[] = userDBList.map(user => {
		/** stock정보에 해당하는 class 불러와서 init */
		const myStockList = user.stockList.reduce((acc: Array<TUserStockInfo>, stockInfo) => {
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
		}, []);

		const myWeaponList = user.weaponList.reduce(
			(acc: Array<TUserWeaponInfo>, weaponInfo) => {
				if (weaponInfo.weapon instanceof Types.ObjectId) {
					return acc;
				}
				const {
					bonusPower,
					curPower,
					destroyCnt,
					failCnt,
					hitRatio,
					missRatio,
					successCnt,
					weapon,
				} = weaponInfo;
				const myWeapon = weaponAllList.find(w => w.type === weapon.type);
				if (myWeapon) {
					acc.push({
						bonusPower,
						curPower,
						destroyCnt,
						failCnt,
						hitRatio,
						missRatio,
						successCnt,
						weapon: myWeapon,
					});
				}
				return acc;
			},
			[],
		);

		return new User({
			id: user.discordId,
			nickname: user.nickname,
			money: user.money,
			stockList: myStockList,
			weaponList: myWeaponList,
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
	dataManager.set('weapon', new WeaponManager({ weaponList: weaponAllList }));
};
