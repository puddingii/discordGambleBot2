import { equal } from 'assert';
import mongoose from 'mongoose';
import Gamble from '../controller/Gamble/Gamble';
import Game from '../controller/Game';
import Weapon from '../controller/Weapon/Weapon';
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

	it('#updateStatus', async function () {
		const weapon = new Weapon();
		const gamble = new Gamble({});
		const myGame = new Game({ userList: [], weapon, gamble });

		const result = await Status.updateStatus(myGame);
		equal(result.code, 1);
	});
});
