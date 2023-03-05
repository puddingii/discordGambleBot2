import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	SelectMenuBuilder,
} from 'discord.js';
import { container } from '../../../../settings/container';
import TYPES from '../../../../interfaces/containerType';
import { IWeaponController } from '../../../../interfaces/common/controller/weapon';

const weaponController = container.get<IWeaponController>(TYPES.WeaponController);

export const getSelectMenu = async () => {
	const weaponList = await weaponController.getAllWeapon();
	return new ActionRowBuilder<SelectMenuBuilder>().addComponents(
		new SelectMenuBuilder()
			.setCustomId('무기강화-main')
			.setPlaceholder('강화할 무기를 고르세요')
			.addOptions(
				weaponList.map(weapon => ({
					label: weapon.name,
					description: weapon.name,
					value: `${weapon.type}/${weapon.name}`,
				})),
			),
	);
};

export const getEnhanceButton = (type: string, name: string) => {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(`무기강화-enhance/${type}/${name}`)
			.setStyle(ButtonStyle.Success)
			.setLabel('강화'),
	);
};

export default {};
