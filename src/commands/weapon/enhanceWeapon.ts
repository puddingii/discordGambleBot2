import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import _ from 'lodash';
import dependency from '../../config/dependencyInjection';
import weaponController from '../../controller/bot/weaponController';

const {
	cradle: { logger },
} = dependency;

export default {
	data: new SlashCommandBuilder()
		.setName('무기강화')
		.setDescription('무기를 강화함')
		.addBooleanOption(option =>
			option.setName('하락방지').setDescription('강화비용0 10배가 추가로 든다.'),
		),
	// .addBooleanOption(option =>
	// 	option.setName('파괴방지').setDescription('강화비용이 20배가 추가로 든다'),
	// ),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const isPreventFail = interaction.options.getBoolean('하락방지') ?? false;
			// const isPreventDestroy = interaction.options.getBoolean('파괴방지') ?? false;

			const [successRatio] = Object.values(
				weaponController.getNextRatio({ discordId, type: 'sword' }),
			).map(ratio => ratio * 100);
			const { code, curPower, beforePower } = weaponController.enhanceWeapon({
				discordId,
				type: 'sword',
				isPreventDestroy: false,
				isPreventDown: isPreventFail,
			});

			let content = `${beforePower}강 ▶︎ ${curPower}강 (성공확률: ${_.round(
				successRatio,
				2,
			)}%)`;
			switch (code) {
				case 2:
					content = `실패! ${content}`;
					break;
				case 3:
					content = `터짐ㅋㅋ ${content}`;
					break;
				default:
					content = `성공! ${content}`;
			}

			await interaction.reply({ content });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
