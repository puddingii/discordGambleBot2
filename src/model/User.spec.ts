import { equal, ok } from 'assert';
import mongoose from 'mongoose';
import path from 'path';
import dotenv from 'dotenv';
import User from './User';

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const mongoUri = `mongodb+srv://${process.env.MONGO_ID}:${process.env.MONGO_PW}@gamblebottest.krflbk1.mongodb.net/?retryWrites=true&w=majority`;
const MY_DISCORD_ID = '370920718302445568';

describe('User Model Test', function () {
	before(async function () {
		await mongoose.connect(mongoUri);
		console.log('[DB] ✅Successfully connected');
	});

	after(function () {
		mongoose.connection.close();
		console.log('[DB] ✅Successfully disconnected');
	});

	describe('#User Validation', function () {
		beforeEach(function () {
			console.log('?');
		});
	});
});
