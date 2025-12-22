import type { CommandDocumentation } from '../helpers/commands.types.js';
import { CommandResponseTypeEnum } from '../helpers/enums.js';
import {
	rollMacroCommandDefinition,
	rollMacroSubCommandEnum,
} from './roll-macro.command-definition.js';
import { RollMacroCommandOptionEnum } from './roll-macro.command-options.js';

export const rollMacroCommandDocumentation: CommandDocumentation<
	typeof rollMacroCommandDefinition
> = {
	name: 'rollMacro',
	description: 'Short roll that can be referenced and used by other rolls. Case insensitive.',
	subCommands: {
		[rollMacroSubCommandEnum.list]: {
			name: rollMacroSubCommandEnum.list,
			description: 'Lists all roll macros available to your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {},
					embeds: [
						{
							title: "Ashara Keenclaw's Roll Macros",
							fields: [
								{
									name: 'ShortbowCritDamage',
									value: '(2*1d6)+d10',
								},
								{
									name: 'ShortbowDamage',
									value: 'd6',
								},
							],
						},
					],
				},
			],
		},
		[rollMacroSubCommandEnum.create]: {
			name: rollMacroSubCommandEnum.create,
			description: 'Creates a roll macro for the active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[RollMacroCommandOptionEnum.name]: 'ShortbowCritDamage',
						[RollMacroCommandOptionEnum.value]: '(2*1d6)+d10',
					},
					message:
						'Yip! I created the roll macro ShortbowCritDamage for Ashara Keenclaw.',
				},
			],
		},
		[rollMacroSubCommandEnum.set]: {
			name: rollMacroSubCommandEnum.set,
			description: 'Sets the value of a roll macro for your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[RollMacroCommandOptionEnum.name]: 'shortbowDamage',
						[RollMacroCommandOptionEnum.value]: '2d6',
					},
					embeds: [
						{
							title: "Yip! Ashara Keenclaw had their roll macro ShortbowDamage set to '2d6'.",
							fields: [],
						},
					],
				},
			],
		},
		[rollMacroSubCommandEnum.remove]: {
			name: rollMacroSubCommandEnum.remove,
			description: 'Removes a roll macro for the active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[RollMacroCommandOptionEnum.name]: 'ShortbowCritDamage',
					},
					message: 'Yip! I removed the roll macro ShortbowCritDamage.',
				},
			],
		},
	},
};
