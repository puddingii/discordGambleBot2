const { SlashCommandBuilder } = require('discord.js');
const _ = require('lodash');
const {
	cradle: { UserModel, logger },
} = require('../../config/dependencyInjection');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('무기강화')
		.setDescription('무기를 강화함')
		.addBooleanOption(option =>
			option.setName('하락방지').setDescription('강화비용이 2배가 든다.'),
		),
	// .addBooleanOption(option =>
	// 	option.setName('파괴방지').setDescription('강화비용이 3배가 든다'),
	// ),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const isPreventFail = interaction.options.getBoolean('하락방지') ?? false;
			const isPreventDestroy = interaction.options.getBoolean('파괴방지') ?? false;

			const beforePower = game.getUser({ discordId }).getWeapon('sword')?.curPower ?? 0;
			const ratioInfo = game.weapon.swordInfo.ratioList[beforePower];
			const successRatio = (1 - (ratioInfo.destroyRatio + ratioInfo.failRatio)) * 100;
			const { code, message, myWeapon, money } = game.weapon.enhanceWeapon(
				discordId,
				'sword',
				false,
				isPreventFail,
			);

			if (!code) {
				await interaction.reply({ content: message });
				return;
			}

			const dbResult = await UserModel.updateWeapon(discordId, myWeapon, money);

			if (!dbResult.code) {
				await interaction.reply({ content: dbResult.message });
				return;
			}

			await interaction.reply({
				content: `${beforePower}강 ▶︎ ${myWeapon.curPower}강 (확률: ${_.round(
					successRatio,
					2,
				)}%)`,
			});
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
