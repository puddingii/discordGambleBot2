import { equal, fail, ok } from 'assert';
import Status from '../../../common/model/Status';
import TYPES from '../../../interfaces/containerType';
import { IUtil } from '../../../interfaces/common/util';
import { container } from '../../../settings/container';

const { getErrorMessage } = container.get<IUtil>(TYPES.Util);

describe('Status model test', function () {
	let statusErrorMessage = '';
	before(async function () {
		try {
			const myStatus = await Status.getStatus(true);

			if (!myStatus) {
				throw Error('아무 정보도 가지고 있지 않습니다.');
			}
			if (!myStatus?.gamble) {
				throw Error('gamble 정보가 없습니다.');
			}
			if (!myStatus?.user) {
				throw Error('user 정보가 없습니다.');
			}
			statusErrorMessage = '';
		} catch (err) {
			const message = getErrorMessage(err);
			statusErrorMessage = message;
		}
	});

	after(async function () {
		await Status.deleteMany({ isTest: true });
	});

	it('Check get Status', function () {
		if (statusErrorMessage === '') {
			ok(true);
		} else {
			fail(statusErrorMessage);
		}
	});

	describe('#updateStatus', function () {
		before(function () {
			if (statusErrorMessage !== '') {
				if (this.test?.parent?.title) {
					this.test.parent.title = "#updateStatus is skipped by 'get status error'";
				}
				this.skip();
			}
		});

		it('Update correct status', async function () {
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
			} catch (err) {
				const message = getErrorMessage(err, 'DB Action Error');
				fail(message);
			}
		});

		it('Update incorrect status', async function () {
			try {
				await Status.updateStatus({});
				fail('This Status update test is expected to fail...');
			} catch (e) {
				ok(true);
			}
		});
	});

	describe('#updateCurTime', function () {
		before(function () {
			if (statusErrorMessage !== '') {
				if (this.test?.parent?.title) {
					this.test.parent.title = "#updateCurTime is skipped by 'get status error'";
				}
				this.skip();
			}
		});

		it('Update correct curTime', async function () {
			try {
				const AFTER_TIME = 123;
				await Status.updateCurTime(AFTER_TIME, true);
				const status = await Status.getStatus(true);
				equal(status.gamble.curTime, AFTER_TIME);
			} catch (err) {
				const message = getErrorMessage(err, 'DB Action Error');
				fail(message);
			}
		});
	});
});
