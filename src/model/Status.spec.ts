import { equal, fail, ok } from 'assert';
import mongoose from 'mongoose';
import Status from './Status';

describe('Status Model Test', function () {
	before(async function () {
		const mongoUri = `mongodb+srv://${process.env.MONGO_ID}:${process.env.MONGO_PW}@gamblebottest.krflbk1.mongodb.net/?retryWrites=true&w=majority`;
		await mongoose.connect(mongoUri);
	});

	after(function () {
		mongoose.connection.close();
	});

	beforeEach('Status Count Test', async function () {
		const statusList = await Status.find({});
		equal(statusList.length, 1);
	});

	// Status
	it('#getStatus', async function () {
		const myStatus = await Status.getStatus();
		equal(!!myStatus, true);
	});

	describe('#updateStatus', function () {
		it('Update Status', async function () {
			try {
				await Status.updateStatus({ gamble: { curCondition: 3, conditionPeriod: 2 } });
				const status = await Status.getStatus();
				equal(status.gamble.curCondition, 3);
				equal(status.gamble.conditionPeriod, 2);
			} catch (e) {
				console.log(e);
				fail('DB Action Error');
			}
		});

		it('Update Status', async function () {
			try {
				await Status.updateStatus({});
				fail('This Status update test is expected to fail...');
			} catch (e) {
				ok(true);
			}
		});
	});
});
