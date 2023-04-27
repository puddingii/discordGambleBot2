import sinon from 'sinon';
import db from '../loaders/db';

(async () => {
	await db();
})();

export const mochaHooks = {
	afterEach() {
		sinon.restore();
	},
};

export default {};
