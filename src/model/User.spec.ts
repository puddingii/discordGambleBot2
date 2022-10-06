import { equal, ok } from 'assert';
import mongoose from 'mongoose';
import User from './User';
import UserControlller from '../controller/User';

const MY_DISCORD_ID = '370920718302445568';

describe('User Model Test', function () {
	before(async function () {
		const mongoUri = `mongodb+srv://${process.env.MONGO_ID}:${process.env.MONGO_PW}@gamblebottest.krflbk1.mongodb.net/?retryWrites=true&w=majority`;
		console.log(mongoUri);
		await mongoose.connect(mongoUri);
		console.log('[DB] ✅Successfully connected');
	});

	after(function () {
		mongoose.connection.close();
		console.log('[DB] ✅Successfully disconnected');
	});

	describe('#findByDiscordId 건빵id', function () {
		it('Unknown UserId', async function () {
			const unknownInfo = await User.findByDiscordId('122');
			equal(!!unknownInfo, false);
		});

		it('Correct UserId', async function () {
			const myInfo = await User.findByDiscordId(MY_DISCORD_ID);
			equal(!!myInfo, true);
		});
	});

	describe('#updateStock 건빵id', function () {
		it('Unknown User', async function () {
			const unknownUserResult = await User.updateStock('123', {
				name: '응애',
				cnt: 1,
				value: 1000,
				money: 1000,
			});
			equal(unknownUserResult.code, 0);
		});

		it('Unknown Stock', async function () {
			const unknownStockResult = await User.updateStock(MY_DISCORD_ID, {
				name: '응z',
				cnt: 1,
				value: 1000,
				money: 1000,
			});
			equal(unknownStockResult.code, 0);
		});

		it('Correct Update', async function () {
			const updateResult = await User.updateStock(MY_DISCORD_ID, {
				name: '응애',
				cnt: 1,
				value: 1000,
				money: 1000,
			});
			equal(updateResult.code, 1);
		});
	});

	describe('#updateMoney 건빵id', function () {
		const myUser = new UserControlller({
			id: MY_DISCORD_ID,
			nickname: 'test',
			stockList: [],
			weaponList: [],
			money: 10000000,
		});
		const unknownUser = new UserControlller({
			id: '12313',
			nickname: 'test',
			stockList: [],
			weaponList: [],
			money: 1000000,
		});

		const controllerList = [myUser, unknownUser];
		it("update userList's money", async function () {
			const result = await User.updateMoney(controllerList);
			equal(result.code, 1);
		});
	});
});
