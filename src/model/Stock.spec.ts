import { equal, fail, ok } from 'assert';
import mongoose from 'mongoose';
import Stock, { UpdatedStockInfo } from './Stock';
import StockController, { StockConstructor } from '../game/Stock/Stock';
// import CoinController from '../controller/Gamble/Coin';
// FIXME 아직 Coin쪽은 미구현이라 나중에 구현되면 테스트코드도 바꿔줘야 함

const TEST_STOCK_INFO: StockConstructor = {
	name: 'TEST_STOCK',
	ratio: { min: -0.5, max: 0.5 },
	type: 'stock',
	updateTime: 4,
	value: 10000,
};
const UNKNOWN_TEST_STOCK_INFO = 'TEST_STOCK2';

const myStock = new StockController(TEST_STOCK_INFO);

describe('User Model Test', function () {
	before(async function () {
		const mongoUri = `mongodb+srv://${process.env.MONGO_ID}:${process.env.MONGO_PW}@gamblebottest.krflbk1.mongodb.net/?retryWrites=true&w=majority`;
		await mongoose.connect(mongoUri);
	});

	after(function () {
		mongoose.connection.close();
	});

	describe('#addStock', function () {
		it('Add Stock Correctly', async function () {
			try {
				const result = await Stock.addStock(myStock);
				equal(result.code, 1);
			} catch (e) {
				fail('DB Action Error...');
			}
		});

		it('Add Duplicated Stock', async function () {
			try {
				const result = await Stock.addStock(myStock);
				equal(result.code, 0);
			} catch (e) {
				fail('DB Action Error...');
			}
		});
	});

	describe('#findByName', function () {
		it('Find Unknown Stock', async function () {
			try {
				const stock = await Stock.findByName(UNKNOWN_TEST_STOCK_INFO);
				equal(!!stock, false);
			} catch (e) {
				fail('DB Action Error...');
			}
		});

		it('Find Stock Correctly', async function () {
			try {
				const stock = await Stock.findByName(TEST_STOCK_INFO.name);
				equal(!!stock, true);
			} catch (e) {
				fail('DB Action Error...');
			}
		});
	});

	describe('#findAllList', function () {
		it('Find Coin List', async function () {
			// FIXME 나중에 Coin쪽 업데이트 되면 할 예정
			try {
				const coinList = await Stock.findAllList('coin');
				equal(coinList.length, 0);
			} catch (e) {
				fail('DB Action Error...');
			}
		});

		it('Find Stock List', async function () {
			try {
				const stockList = await Stock.findAllList('stock');
				equal(stockList.length > 0, true);
			} catch (e) {
				fail('DB Action Error...');
			}
		});

		it('Find All List', async function () {
			try {
				const allList = await Stock.findAllList('all');
				equal(allList.length > 0, true);
			} catch (e) {
				fail('DB Action Error...');
			}
		});
	});

	describe('#updateStockList', function () {
		it('Update Stock List', async function () {
			try {
				myStock.value = 1234;
				await Stock.updateStockList([myStock]);
				const updatedStock = await Stock.findByName(myStock.name);
				equal(updatedStock.value, 1234);
			} catch (e) {
				fail('DB Action Error...');
			}
		});

		// FIXME 나중에 Coin쪽 업데이트 되면 할 예정
		it.skip('Update Coin List', async function () {
			try {
				myStock.comment = 'WTF';
				await Stock.updateStockList([myStock]);
				const updatedStock = await Stock.findByName(myStock.name);
				equal(updatedStock.comment, 'WTF');
			} catch (e) {
				fail('DB Action Error...');
			}
		});
	});

	describe('#updateStock', function () {
		const defaultInfo: UpdatedStockInfo = {
			comment: 'FTW',
			conditionList: [1, 2, 3, 4, 5],
			correctionCnt: 4,
			dividend: 4,
			maxRatio: TEST_STOCK_INFO.ratio.max,
			minRatio: TEST_STOCK_INFO.ratio.min,
			name: TEST_STOCK_INFO.name,
			type: TEST_STOCK_INFO.type,
			value: TEST_STOCK_INFO.value,
		};
		it('Update Unknown Stock', async function () {
			try {
				const updatedInfo = { ...defaultInfo, name: UNKNOWN_TEST_STOCK_INFO };
				await Stock.updateStock(updatedInfo);
				fail('Stock is updated...This stock update test is expected to fail...');
			} catch (e) {
				ok(true);
			}
		});

		it('Update Stock', async function () {
			try {
				const updatedInfo = { ...defaultInfo };
				await Stock.updateStock(updatedInfo);
				const updatedStock = await Stock.findByName(myStock.name);
				equal(updatedStock.comment, 'FTW');
			} catch (e) {
				fail('DB Action Error...');
			}
		});
	});

	describe('#getUpdateHistory', function () {
		before(async function () {
			const stock = await Stock.findOne({ name: TEST_STOCK_INFO.name });
			Array(49)
				.fill(false)
				.forEach((_, idx) => {
					stock?.updHistory.push({
						value: idx,
						date: '123123',
					});
				});
			await stock?.save();
		});

		it('Get Overflow Count', async function () {
			try {
				const list = await Stock.getUpdateHistory(TEST_STOCK_INFO.name, 70);
				equal(list.length, 50);
			} catch (e) {
				console.log(e);
				fail('DB Action Error...');
			}
		});

		it('Get Under Count', async function () {
			try {
				const list = await Stock.getUpdateHistory(TEST_STOCK_INFO.name, 30);
				equal(list.length, 30);
			} catch (e) {
				console.log(e);
				fail('DB Action Error...');
			}
		});

		it('Get Correct Count', async function () {
			try {
				const list = await Stock.getUpdateHistory(TEST_STOCK_INFO.name, 50);
				equal(list.length, 50);
			} catch (e) {
				console.log(e);
				fail('DB Action Error...');
			}
		});
	});

	describe('#deleteOne', function () {
		it('Delete Unknown Stock', async function () {
			try {
				await Stock.deleteOne({ name: UNKNOWN_TEST_STOCK_INFO });
				fail('s');
			} catch (e) {
				ok(true);
			}
		});

		it('Delete Stock Correctly', async function () {
			try {
				await Stock.deleteOne({ name: TEST_STOCK_INFO.name });
				ok(true);
			} catch (e) {
				fail('DB Action Error...');
			}
		});
	});
});
