import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import dependency from '../../config/dependencyInjection';
import Game from '../../controller/Game';

const {
	cradle: { UserModel, logger },
} = dependency;

export default {
	data: new SlashCommandBuilder()
		.setName('주식풀매수')
		.setDescription('주식 or 코인 풀매수')
		.addStringOption(option =>
			option.setName('이름').setDescription('주식이름').setRequired(true),
		),
	async execute(interaction: ChatInputCommandInteraction, game: Game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const name = interaction.options.getString('이름') ?? '';

			const gambleResult = game.gamble.buySellStock(discordId, name, 1, true);
			if (
				!gambleResult.code ||
				!gambleResult.cnt ||
				!gambleResult.value ||
				!gambleResult.money
			) {
				await interaction.reply({ content: gambleResult.message });
				return;
			}

			const dbResult = await UserModel.updateStock(discordId, {
				name,
				cnt: gambleResult.cnt,
				value: gambleResult.value,
				money: gambleResult.money,
			});
			if (!dbResult.code) {
				await interaction.reply({ content: dbResult.message });
				return;
			}

			await interaction.reply({ content: '풀매수완료!' });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
