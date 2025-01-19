import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { CommandDefinition } from '../helpers/commands.d.js';
import {
	ConditionCommandOptionEnum,
	conditionCommandOptions,
} from './condition.command-options.js';

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
		dm_permission: true,
		default_member_permissions: undefined,
	},
	subCommands: {
		[ConditionSubCommandEnum.applyCustom]: {
			name: 'apply-custom',
			description: 'Applies a custom condition to a target',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				/*
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					ModifierOptions.MODIFIER_NAME_OPTION,
					ModifierOptions.MODIFIER_SEVERITY_VALUE_OPTION,
					ModifierOptions.MODIFIER_SHEET_VALUES_OPTION,
					ModifierOptions.MODIFIER_ROLL_ADJUSTMENT,
					ModifierOptions.MODIFIER_ROLL_TARGET_TAGS_OPTION,
					ModifierOptions.MODIFIER_TYPE_OPTION,
					ModifierOptions.MODIFIER_DESCRIPTION_OPTION,
					ModifierOptions.MODIFIER_INITIATIVE_NOTE_OPTION,
				*/
			},
		},
		[ConditionSubCommandEnum.applyModifier]: {
			name: 'apply-modifier',
			description: 'Applies your existing modifier to a target as a condition',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				/**
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					{
						...ModifierOptions.MODIFIER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				 */
			},
		},
		[ConditionSubCommandEnum.list]: {
			name: 'list',
			description: "Lists all of a character's conditions",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				/**
				GameplayOptions.GAMEPLAY_TARGET_CHARACTER
				 */
			},
		},
		[ConditionSubCommandEnum.set]: {
			name: 'set',
			description: 'Sets a property of a condition on a target',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				/**
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					ConditionOptions.CONDITION_NAME_OPTION,
					ModifierOptions.MODIFIER_SET_OPTION,
					ModifierOptions.MODIFIER_SET_VALUE_OPTION,
				 */
			},
		},
		[ConditionSubCommandEnum.remove]: {
			name: 'remove',
			description: 'Removes a condition from a target',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				/**
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					ConditionOptions.CONDITION_NAME_OPTION,
				 */
				[ConditionCommandOptionEnum.name]:
					conditionCommandOptions[ConditionCommandOptionEnum.name],
			},
		},
		[ConditionSubCommandEnum.severity]: {
			name: 'severity',
			description: 'Changes the severity of a condition on a target',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				/**
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					ConditionOptions.CONDITION_NAME_OPTION,
					{ ...ModifierOptions.MODIFIER_SEVERITY_VALUE_OPTION, required: true },
				 */
				[ConditionCommandOptionEnum.name]:
					conditionCommandOptions[ConditionCommandOptionEnum.name],
			},
		},
	},
} satisfies CommandDefinition<ConditionSubCommandEnum>;
