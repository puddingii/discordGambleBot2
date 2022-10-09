import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import dependency from '../../config/dependencyInjection';
import { setComma } from '../../config/util';
import Game from '../../controller/Game';

const {
	cradle: { logger },
} = dependency;

export default {
	data: new SlashCommandBuilder().setName('내돈').setDescription('가지고 있는 돈'),
	async execute(interaction: ChatInputCommandInteraction, game: Game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();

			const userInfo = game.getUser({ discordId });
			let content = '유저정보가 없는 정보입니다';

			if (userInfo) {
				content = `가지고 있는 돈: ${setComma(userInfo.money, true)}원`;
			}
			await interaction.reply({ content });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
