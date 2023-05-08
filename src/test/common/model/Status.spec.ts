import { equal, fail, ok } from 'assert';
import Status from '../../../common/model/Status';

describe('Status Model Test', function () {
	after(async function () {
		await Status.deleteMany({ isTest: true });
	});

	it('Get Status', async function () {
		const myStatus = await Status.getStatus(true);
		equal(!!myStatus, true);
	});

	describe('#updateStatus', function () {
		it('Update Correct Status', async function () {
			try {
				const beforeStatus = await Status.getStatus(true);
				await Status.updateStatus(
					{ gamble: { curCondition: 3, conditionPeriod: 4 } },
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

		it('Update Incorrect Status', async function () {
			try {
				await Status.updateStatus({});
				fail('This Status update test is expected to fail...');
			} catch (e) {
				ok(true);
			}
		});
	});
});
