import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import _ from 'lodash';
import dependency from '../../config/dependencyInjection';
import Game from '../../controller/Game';

const {
	cradle: { UserModel, logger },
} = dependency;

export default {
	data: new SlashCommandBuilder()
		.setName('무기강화')
		.setDescription('무기를 강화함')
		.addBooleanOption(option =>
			option.setName('하락방지').setDescription('강화비용이 2배가 든다.'),
		),
	// .addBooleanOption(option =>
	// 	option.setName('파괴방지').setDescription('강화비용이 3배가 든다'),
	// ),
	async execute(interaction: ChatInputCommandInteraction, game: Game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const isPreventFail = interaction.options.getBoolean('하락방지') ?? false;
			const isPreventDestroy = interaction.options.getBoolean('파괴방지') ?? false;

			const beforePower = game.getUser({ discordId })?.getWeapon('sword')?.curPower ?? 0;
			const ratioInfo = game.weapon.swordInfo.ratioList[beforePower];
			const successRatio = (1 - (ratioInfo.destroyRatio + ratioInfo.failRatio)) * 100;
			const { code, myWeapon, money } = game.weapon.enhanceWeapon(
				discordId,
				'sword',
				false,
				isPreventFail,
			);

			let content;
			switch (code) {
				case 2:
					content = `실패! ${beforePower}강 ▶︎ ${myWeapon.curPower}강 (확률: ${_.round(
						successRatio,
						2,
					)}%)`;
					break;
				case 3:
					content = `터짐ㅋㅋ ${beforePower}강 ▶︎ ${myWeapon.curPower}강`;
					break;
				default:
					content = `성공! ${beforePower}강 ▶︎ ${myWeapon.curPower}강 (확률: ${_.round(
						successRatio,
						2,
					)}%)`;
			}

			const dbResult = await UserModel.updateWeapon(discordId, myWeapon, money);

			if (!dbResult.code) {
				await interaction.reply({ content: dbResult.message });
				return;
			}

			await interaction.reply({ content });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
