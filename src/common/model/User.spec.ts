// import { equal, ok, fail } from 'assert';
// import mongoose from 'mongoose';
// import User from './User';
// // import UserControlller from '../game/User/User';
// // import SwordController from '../game/Weapon/Sword';

// // 건빵 id는 계속 db에 남겨둘것.
// const TEST_NICKNAME = '모카테스트';
// const TEST_DISCORD_ID = '1234567890';
// const formatCatchError = (err: unknown, defaultMessage: string) => {
// 	let errorMessage = '';
// 	if (err instanceof Error) {
// 		errorMessage = err.message;
// 	}
// 	if (typeof err === 'string') {
// 		errorMessage = err;
// 	}
// 	if (!err) {
// 		errorMessage = defaultMessage;
// 	}
// 	return errorMessage;
// };

// describe('User Model Test', function () {
// 	before(async function () {
// 		const mongoUri = `mongodb+srv://${process.env.MONGO_ID}:${process.env.MONGO_PW}@gamblebottest.krflbk1.mongodb.net/?retryWrites=true&w=majority`;
// 		await mongoose.connect(mongoUri);
// 	});

// 	after(function () {
// 		mongoose.connection.close();
// 	});

// 	describe('#create', function () {
// 		it('Create Incorrect User', async function () {
// 			try {
// 				const nickname = '음?';
// 				await User.create({ nickname });
// 				await User.deleteOne({ nickname });
// 				fail('User is created...This user create test is expected to fail...');
// 			} catch (e) {
// 				ok(true);
// 			}
// 		});

// 		it('Create Test User', async function () {
// 			try {
// 				const user = await User.create({
// 					discordId: TEST_DISCORD_ID,
// 					nickname: TEST_NICKNAME,
// 				});
// 				equal(!!user, true);
// 			} catch (e) {
// 				fail('User create is failed...');
// 			}
// 		});

// 		it('Create Duplicated DiscordID Of User', async function () {
// 			try {
// 				const otherNickname = '123';
// 				await User.create({
// 					discordId: TEST_DISCORD_ID,
// 					nickname: otherNickname,
// 				});
// 				await User.deleteOne({ nickname: otherNickname });
// 				fail('User is created...This user create test is expected to fail...');
// 			} catch (e) {
// 				ok(true);
// 			}
// 		});

// 		it('Create Duplicated Nickname Of User', async function () {
// 			try {
// 				const otherDiscordId = '12312321313213';
// 				await User.create({
// 					discordId: otherDiscordId,
// 					nickname: TEST_NICKNAME,
// 				});
// 				await User.deleteOne({ discordId: otherDiscordId });
// 				fail('User is created...This user create test is expected to fail...');
// 			} catch (e) {
// 				ok(true);
// 			}
// 		});
// 	});

// 	describe('#findByUserInfo', function () {
// 		it('Unknown UserId', async function () {
// 			try {
// 				const unknownInfo = await User.findByUserInfo('122');
// 				equal(!!unknownInfo, false);
// 			} catch (err) {
// 				const errorMessage = formatCatchError(err, 'DB Error');
// 				fail(errorMessage);
// 			}
// 		});

// 		it('Correct UserId', async function () {
// 			try {
// 				const myInfo = await User.findByUserInfo(TEST_DISCORD_ID);
// 				equal(!!myInfo, true);
// 			} catch (err) {
// 				const errorMessage = formatCatchError(err, 'DB Error');
// 				fail(errorMessage);
// 			}
// 		});
// 	});

// 	// describe('#updateStock', function () {
// 	// 	it('Unknown User', async function () {
// 	// 		try {
// 	// 			const unknownUserResult = await User.updateStock('123', {
// 	// 				name: '응애',
// 	// 				cnt: 1,
// 	// 				value: 1000,
// 	// 				money: 1000,
// 	// 			});
// 	// 			equal(unknownUserResult.code, 0);
// 	// 		} catch (err) {
// 	// 			const errorMessage = formatCatchError(err, 'DB Error');
// 	// 			fail(errorMessage);
// 	// 		}
// 	// 	});

// 	// 	it('Unknown Stock', async function () {
// 	// 		try {
// 	// 			const unknownStockResult = await User.updateStock(TEST_DISCORD_ID, {
// 	// 				name: '응z',
// 	// 				cnt: 1,
// 	// 				value: 1000,
// 	// 				money: 1000,
// 	// 			});
// 	// 			equal(unknownStockResult.code, 0);
// 	// 		} catch (err) {
// 	// 			const errorMessage = formatCatchError(err, 'DB Error');
// 	// 			fail(errorMessage);
// 	// 		}
// 	// 	});

// 	// 	it('Correct Update', async function () {
// 	// 		try {
// 	// 			const updateResult = await User.updateStock(TEST_DISCORD_ID, {
// 	// 				name: '응애',
// 	// 				cnt: 1,
// 	// 				value: 1000,
// 	// 				money: 1000,
// 	// 			});
// 	// 			equal(updateResult.code, 1);
// 	// 		} catch (err) {
// 	// 			const errorMessage = formatCatchError(err, 'DB Error');
// 	// 			fail(errorMessage);
// 	// 		}
// 	// 	});
// 	// });

// 	// describe('#updateMoney', function () {
// 	// 	const myUser = new UserControlller({
// 	// 		id: TEST_DISCORD_ID,
// 	// 		nickname: 'test',
// 	// 		stockList: [],
// 	// 		weaponList: [],
// 	// 		money: 10000000,
// 	// 	});
// 	// 	const unknownUser = new UserControlller({
// 	// 		id: '12313',
// 	// 		nickname: 'test',
// 	// 		stockList: [],
// 	// 		weaponList: [],
// 	// 		money: 1000000,
// 	// 	});

// 	// 	const controllerList = [myUser, unknownUser];
// 	// 	it("update userList's money", async function () {
// 	// 		try {
// 	// 			await User.updateMoney(controllerList);
// 	// 			ok(1);
// 	// 		} catch (err) {
// 	// 			const errorMessage = formatCatchError(err, 'DB Error');
// 	// 			fail(errorMessage);
// 	// 		}
// 	// 	});
// 	// });

// 	// describe('#updateWeapon', function () {
// 	// 	const mySwordController = new SwordController({ curPower: 5 });
// 	// 	it('Unknown User', async function () {
// 	// 		try {
// 	// 			await User.updateWeapon('asdf', mySwordController, 5000000);
// 	// 			fail('Weapon is updated...This weapon update test is expected to fail...');
// 	// 		} catch (err) {
// 	// 			ok(true);
// 	// 		}
// 	// 	});
// 	// 	it('Correct Update', async function () {
// 	// 		try {
// 	// 			const beforeInfo = await User.findByUserInfo(TEST_DISCORD_ID);
// 	// 			await User.updateWeapon(TEST_DISCORD_ID, mySwordController, 5000000);
// 	// 			const afterInfo = await User.findByUserInfo(TEST_DISCORD_ID);
// 	// 			equal(afterInfo.money, 5000000);
// 	// 			equal(beforeInfo.weaponList[0].bonusPower, afterInfo.weaponList[0].bonusPower);
// 	// 			equal(afterInfo.weaponList[0].curPower, 5);
// 	// 		} catch (err) {
// 	// 			const errorMessage = formatCatchError(err, 'DB Error');
// 	// 			fail(errorMessage);
// 	// 		}
// 	// 	});
// 	// });

// 	describe('#delete', function () {
// 		it('Delete Unknown User', async function () {
// 			try {
// 				await User.deleteOne({
// 					discordId: '22',
// 					nickname: TEST_NICKNAME,
// 				});
// 				fail('Fail to delete test user');
// 			} catch (e) {
// 				ok(true);
// 			}
// 		});

// 		it('Delete Test User', async function () {
// 			try {
// 				const result = await User.deleteOne({
// 					discordId: TEST_DISCORD_ID,
// 					nickname: TEST_NICKNAME,
// 				});
// 				equal(result.deletedCount, 1);
// 			} catch (err) {
// 				const errorMessage = formatCatchError(err, 'Fail to delete test user');
// 				fail(errorMessage);
// 			}
// 		});
// 	});
// });
