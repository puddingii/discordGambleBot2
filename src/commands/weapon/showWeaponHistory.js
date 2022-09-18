const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dayjs = require('dayjs');
const {
	cradle: { logger },
} = require('../../config/dependencyInjection');

module.exports = {
	data: new SlashCommandBuilder().setName('무기내역').setDescription('무기강화 내역'),
	/**
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @param {import('../../controller/Game')} game
	 */
	async execute(interaction, game) {
		try {
			/** Discord Info */
			const discordId = interaction.user.id.toString();

			const myWeapon = game.getUser({ discordId }).getWeapon('sword');
			if (!myWeapon) {
				await interaction.reply({ content: '내역 없음' });
				return;
			}

			const embedBox = new EmbedBuilder();
			embedBox
				.setColor('#0099ff')
				.setTitle('강화 히스토리')
				.setDescription(`${dayjs().format('M월 DD일')}까지 히스토리`)
				.addFields({ name: '\u200B', value: '\u200B' })
				.setTimestamp();

			embedBox.addFields({
				name: '히스토리',
				value: `현재 강화: ${myWeapon.curPower}강\n보너스 수치: ${myWeapon.bonusPower}\n성공: ${myWeapon.successCnt}번\n실패: ${myWeapon.failCnt}번\n파괴: ${myWeapon.destroyCnt}번`,
			});

			await interaction.reply({ embeds: [embedBox] });
		} catch (err) {
			logger.error(err);
			await interaction.reply({ content: `${err}` });
		}
	},
};
