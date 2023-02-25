import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import userController from '../../controller/userController';
import { container } from '../../settings/container';
import TYPES from '../../interfaces/containerType';
import { ILogger } from '../../util/logger';

const logger = container.get<ILogger>(TYPES.Logger);

// FIXME 나중에 셀렉터로 바꿔야함
export default {
	data: new SlashCommandBuilder()
		.setName('무기강화')
		.setDescription('무기를 강화함')
		.addStringOption(option =>
			option.setName('종류').setDescription('강화할 무기').addChoices(
				{
					name: '무기',
					value: 'sword',
				},
				// {
				// 	name: '코인',
				// 	value: 'coin',
				// },
			),
		),
	// .addBooleanOption(option =>
	// 	option.setName('파괴방지').setDescription('강화비용이 20배가 추가로 든다'),
	// ),
	async execute(interaction: ChatInputCommandInteraction) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();
			const type = <'sword'>interaction.options.getString('종류') ?? 'sword';
			// const isPreventDestroy = interaction.options.getBoolean('파괴방지') ?? false;

			const { code, curPower, beforePower } = await userController.enhanceWeapon({
				discordId,
				type,
				isPreventDestroy: false,
				isPreventDown: false,
			});

			let content = `${beforePower}강 ▶︎ ${curPower}강 `;
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
			logger.error(err, ['Command']);
			await interaction.reply({ content: `${err}` });
		}
	},
};
