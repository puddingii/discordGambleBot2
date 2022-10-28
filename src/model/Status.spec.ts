import { equal, fail, ok } from 'assert';
import mongoose from 'mongoose';
import Status from './Status';

describe('Status Model Test', function () {
	before(async function () {
		const mongoUri = `mongodb+srv://${process.env.MONGO_ID}:${process.env.MONGO_PW}@gamblebottest.krflbk1.mongodb.net/?retryWrites=true&w=majority`;
		await mongoose.connect(mongoUri);
	});

	after(async function () {
		await Status.deleteMany({ isTest: true });
		mongoose.connection.close();
	});

	it('#getStatus', async function () {
		const myStatus = await Status.getStatus(true);
		equal(!!myStatus, true);
	});

	describe('#updateStatus', function () {
		it('Update Status', async function () {
			try {
				const beforeStatus = await Status.getStatus(true);
				await Status.updateStatus(
					{ gamble: { curCondition: 3, conditionPeriod: 4 } },
					null,
					true,
				);
				const status = await Status.getStatus(true);
				equal(status.gamble.curCondition, 3);
				equal(status.gamble.conditionPeriod, 4);
				equal(beforeStatus.gamble.curTime, status.gamble.curTime);
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
