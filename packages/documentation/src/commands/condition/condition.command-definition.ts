import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.d.ts';
import {
	ConditionCommandOptionEnum,
	conditionCommandOptions,
} from './condition.command-options.js';
import {
	GameplayCommandOptionEnum,
	gameplayCommandOptions,
} from '../gameplay/gameplay.command-options.js';
import {
	ModifierCommandOptionEnum,
	modifierCommandOptions,
} from '../modifier/modifier.command-options.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';

export enum ConditionSubCommandEnum {
	applyCustom = 'apply-custom',
	applyModifier = 'apply-modifier',
	list = 'list',
	set = 'set',
	remove = 'remove',
	severity = 'severity',
}

export const conditionCommandDefinition = {
	metadata: {
		name: 'condition',
		description: 'Commands for applying conditions to characters or creatures.',
		type: ApplicationCommandType.ChatInput,
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[ConditionSubCommandEnum.applyCustom]: {
			name: ConditionSubCommandEnum.applyCustom,
			description: 'Applies a custom condition to a target',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplayTargetCharacter]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
					1
				),
				[ModifierCommandOptionEnum.name]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.name],
					2
				),
				[ModifierCommandOptionEnum.severity]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.severity],
					3
				),
				[ModifierCommandOptionEnum.sheetValues]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.sheetValues],
					4
				),
				[ModifierCommandOptionEnum.rollAdjustment]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.rollAdjustment],
					5
				),
				[ModifierCommandOptionEnum.targetTags]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.targetTags],
					6
				),
				[ModifierCommandOptionEnum.type]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.type],
					7
				),
				[ModifierCommandOptionEnum.description]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.description],
					8
				),
				[ModifierCommandOptionEnum.initiativeNote]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.initiativeNote],
					9
				),
			},
		},
		[ConditionSubCommandEnum.applyModifier]: {
			name: ConditionSubCommandEnum.applyModifier,
			description: 'Applies your existing modifier to a target as a condition',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplayTargetCharacter]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
					1
				),
				[ModifierCommandOptionEnum.name]: withOrder(
					{
						...modifierCommandOptions[ModifierCommandOptionEnum.name],
						required: false,
					},
					2
				),
			},
		},
		[ConditionSubCommandEnum.list]: {
			name: ConditionSubCommandEnum.list,
			description: "Lists all of a character's conditions",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplayTargetCharacter]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
					1
				),
			},
		},
		[ConditionSubCommandEnum.set]: {
			name: ConditionSubCommandEnum.set,
			description: 'Sets a property of a condition on a target',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplayTargetCharacter]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
					1
				),
				[ConditionCommandOptionEnum.name]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.name],
					2
				),
				[ModifierCommandOptionEnum.setOption]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.setOption],
					3
				),
				[ModifierCommandOptionEnum.setValue]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.setValue],
					4
				),
			},
		},
		[ConditionSubCommandEnum.remove]: {
			name: ConditionSubCommandEnum.remove,
			description: 'Removes a condition from a target',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplayTargetCharacter]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
					1
				),
				[ConditionCommandOptionEnum.name]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.name],
					2
				),
			},
		},
		[ConditionSubCommandEnum.severity]: {
			name: ConditionSubCommandEnum.severity,
			description: 'Changes the severity of a condition on a target',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplayTargetCharacter]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
					1
				),
				[ConditionCommandOptionEnum.name]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.name],
					2
				),
				[ModifierCommandOptionEnum.severity]: withOrder(
					{
						...modifierCommandOptions[ModifierCommandOptionEnum.severity],
						required: true,
					},
					3
				),
			},
		},
	},
} satisfies CommandDefinition<ConditionSubCommandEnum>;
