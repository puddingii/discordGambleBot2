const dbLoader = require('./db');
const gameLoader = require('./game');
const botLoader = require('./bot');

/**
 * @param {object} app
 * @param {import('discord.js').Client} app.client
 */
module.exports = async ({ client }) => {
	const dbResult = await dbLoader();
	if (!dbResult.code) {
		return;
	}
	const game = await gameLoader();
	botLoader(client, game);
};
