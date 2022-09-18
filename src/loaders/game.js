const Gamble = require('../controller/Gamble/Gamble');
const Stock = require('../controller/Gamble/Stock');
const Coin = require('../controller/Gamble/Coin');
const Game = require('../controller/Game');
const User = require('../controller/User');
const Weapon = require('../controller/Weapon/Weapon');
const Sword = require('../controller/Weapon/Sword');
const {
	cradle: { UserModel, StockModel, StatusModel, secretKey },
} = require('../config/dependencyInjection');

module.exports = async () => {
	const stockAllList = await StockModel.find({});
	const { stockList, coinList } = stockAllList.reduce(
		(acc, cur) => {
			if (cur.type === 'stock') {
				const stock = new Stock({
					ratio: { min: cur.minRatio, max: cur.maxRatio },
					...cur._doc,
				});
				acc.stockList.push(stock);
			} else {
				const coin = new Coin({
					ratio: { min: cur.minRatio, max: cur.maxRatio },
					...cur._doc,
				});
				acc.coinList.push(coin);
			}
			return acc;
		},
		{ stockList: [], coinList: [] },
	);

	let userList = await UserModel.find({}).populate('stockList.stock');
	userList = userList.map(user => {
		/** stock정보에 해당하는 class 불러와서 init */
		const myStockList = user.stockList.reduce((acc, stockInfo) => {
			const {
				stock: { type, name },
				cnt,
				value,
			} = stockInfo;
			const list = type === 'stock' ? stockList : coinList;
			const stock = list.find(stock => stock.name === name);
			if (stock) {
				acc.push({ stock, cnt, value });
			}
			return acc;
		}, []);

		const weaponList = user.weaponList.map(weapon => {
			return new Sword(weapon._doc);
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

	const weapon = new Weapon();
	const gamble = new Gamble({
		coinList,
		stockList,
		conditionPeriod,
		curTime,
		curCondition,
		conditionRatioPerList,
	});
	const game = new Game({ userList, gamble, weapon, grantMoney });
	setInterval(() => {
		/** 12시간마다 컨디션 조정 */
		if (game.gamble.curTime % game.gamble.conditionPeriod === 0) {
			game.gamble.updateCondition();
		}
		game.gamble.curTime++;
		game.updateGrantMoney();
		const { stockList, userList } = game.gamble.update();
		stockList.length && StockModel.updateStockList(stockList);
		userList.length && UserModel.updateMoney(userList);
		if (game.gamble.curTime % 4 === 0) {
			StatusModel.updateStatus(game);
		}
	}, 1000 * secretKey.gambleUpdateTime); // 맨 뒤의 값이 분단위임
	return game;
};
