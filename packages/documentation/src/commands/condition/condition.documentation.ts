import { GameplayCommandOptionEnum } from '../gameplay/index.js';
import type { CommandDocumentation } from '../helpers/commands.types.js';
import { CommandResponseTypeEnum } from '../helpers/enums.js';
import { ModifierCommandOptionEnum } from '../modifier/index.js';
import {
	conditionCommandDefinition,
	ConditionSubCommandEnum,
} from './condition.command-definition.js';
import { ConditionCommandOptionEnum } from './condition.command-options.js';

export const conditionCommandDocumentation: CommandDocumentation<
	typeof conditionCommandDefinition
> = {
	name: 'condition',
	description: 'Commands for applying conditions to characters or creatures.',
	subCommands: {
		[ConditionSubCommandEnum.applyCustom]: {
			name: ConditionSubCommandEnum.applyCustom,
			description: 'Applies a custom condition to a target',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I applied the condition Blinded to Kobold Cavern Mage..',
					options: {
						[GameplayCommandOptionEnum.gameplayTargetCharacter]: 'Kobold Cavern Mage',
						[ModifierCommandOptionEnum.name]: 'Blinded',
						[ModifierCommandOptionEnum.sheetValues]: 'perception - 4',
						[ModifierCommandOptionEnum.type]: '',
						[ModifierCommandOptionEnum.description]:
							"All normal terrain is difficult terrain to you. You can't detect anything using vision. You automatically critically fail sight Perception checks, you take a –4 status penalty to Perception checks. You are immune to visual effects.",
						[ModifierCommandOptionEnum.initiativeNote]:
							'Immune to visual. All terrain difficult.',
					},
				},
				{
					title: 'Severity',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I applied the condition Frightened to Kobold Cavern Mage.',
					options: {
						[GameplayCommandOptionEnum.gameplayTargetCharacter]: 'Kobold Cavern Mage',
						[ModifierCommandOptionEnum.name]: 'Frightened',
						[ModifierCommandOptionEnum.sheetValues]: '-[severity] to checks and DCs',
						[ModifierCommandOptionEnum.type]: 'status',
						[ModifierCommandOptionEnum.rollAdjustment]: '-[severity]',
						[ModifierCommandOptionEnum.targetTags]: 'attack and not damage',
						[ModifierCommandOptionEnum.severity]: 1,
					},
				},
			],
		},
		[ConditionSubCommandEnum.applyModifier]: {
			name: ConditionSubCommandEnum.applyModifier,
			description: 'Applies your existing modifier to a target as a condition',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I applied the condition Off Guard to Kobold Cavern Mage.',
					options: {
						[GameplayCommandOptionEnum.gameplayTargetCharacter]: 'Kobold Cavern Mage',
						[ModifierCommandOptionEnum.name]: 'Lilac Sootsnout - Off Guard',
					},
				},
			],
		},
		[ConditionSubCommandEnum.list]: {
			name: ConditionSubCommandEnum.list,
			description: "Lists all of a character's conditions",
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[GameplayCommandOptionEnum.gameplayTargetCharacter]: 'Kobold Cavern Mage',
					},
					embeds: [
						{
							title: "Kobold Cavern Mage's Conditions",
							// @ts-expect-error
							image: 'https://2e.aonprd.com/Images/Monsters/Kobold_Cavern_Mage.webp',
							fields: [
								{
									name: 'Blinded',
									value: "All normal terrain is difficult terrain to you. You can't detect anything using vision. You automatically critically fail sight Perception checks, you take a –4 status penalty to Perception checks. You are immune to visual effects.\n\nType: `status`\n\nSheet Adjustments: `perceptionBonus - 4`",
									inline: true,
									inlineIndex: 1,
								},
								{
									name: 'Off Guard',
									value: 'Type: `circumstance`\n\nSheet Adjustments: `ac - 2`',
									inline: true,
									inlineIndex: 2,
								},
							],
						},
					],
				},
			],
		},
		[ConditionSubCommandEnum.set]: {
			name: ConditionSubCommandEnum.set,
			description: 'Sets a property of a condition on a target',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						"Yip! Kobold Cavern Mage had their condition Blinded's sheet-values set to perceptionBonus - 4.",
					options: {
						[GameplayCommandOptionEnum.gameplayTargetCharacter]: 'Kobold Cavern Mage',
						[ConditionCommandOptionEnum.name]: 'Blinded',
						[ModifierCommandOptionEnum.setOption]: 'sheet-values',
						[ModifierCommandOptionEnum.setValue]: 'perceptionBonus - 4',
					},
				},
			],
		},
		[ConditionSubCommandEnum.remove]: {
			name: ConditionSubCommandEnum.remove,
			description: 'Removes a condition from a target',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I removed the condition Blinded from Kobold Cavern Mage.',
					options: {
						[GameplayCommandOptionEnum.gameplayTargetCharacter]: 'Kobold Cavern Mage',
						[ConditionCommandOptionEnum.name]: 'Blinded',
					},
				},
			],
		},
		[ConditionSubCommandEnum.severity]: {
			name: ConditionSubCommandEnum.severity,
			description: 'Changes the severity of a condition on a target',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! I changed the severity of Frightened to 2 for Kobold Cavern Mage.',
					options: {
						[GameplayCommandOptionEnum.gameplayTargetCharacter]: 'Kobold Cavern Mage',
						[ConditionCommandOptionEnum.name]: 'Frightened',
						[ModifierCommandOptionEnum.severity]: 2,
					},
				},
			],
		},
	},
};
