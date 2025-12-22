import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.types.js';
import {
	ConditionCommandOptionEnum,
	conditionCommandOptions,
} from './condition.command-options.js';
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
				[ConditionCommandOptionEnum.targetCharacter]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.targetCharacter],
					1
				),
				[ConditionCommandOptionEnum.name]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.name],
					2
				),
				[ConditionCommandOptionEnum.severity]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.severity],
					3
				),
				[ConditionCommandOptionEnum.sheetValues]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.sheetValues],
					4
				),
				[ConditionCommandOptionEnum.rollAdjustment]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.rollAdjustment],
					5
				),
				[ConditionCommandOptionEnum.targetTags]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.targetTags],
					6
				),
				[ConditionCommandOptionEnum.type]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.type],
					7
				),
				[ConditionCommandOptionEnum.description]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.description],
					8
				),
				[ConditionCommandOptionEnum.initiativeNote]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.initiativeNote],
					9
				),
			},
		},
		[ConditionSubCommandEnum.applyModifier]: {
			name: ConditionSubCommandEnum.applyModifier,
			description: 'Applies your existing modifier to a target as a condition',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ConditionCommandOptionEnum.targetCharacter]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.targetCharacter],
					1
				),
				[ConditionCommandOptionEnum.name]: withOrder(
					{
						...conditionCommandOptions[ConditionCommandOptionEnum.name],
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
				[ConditionCommandOptionEnum.targetCharacter]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.targetCharacter],
					1
				),
			},
		},
		[ConditionSubCommandEnum.set]: {
			name: ConditionSubCommandEnum.set,
			description: 'Sets a property of a condition on a target',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ConditionCommandOptionEnum.targetCharacter]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.targetCharacter],
					1
				),
				[ConditionCommandOptionEnum.name]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.name],
					2
				),
				[ConditionCommandOptionEnum.setOption]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.setOption],
					3
				),
				[ConditionCommandOptionEnum.setValue]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.setValue],
					4
				),
			},
		},
		[ConditionSubCommandEnum.remove]: {
			name: ConditionSubCommandEnum.remove,
			description: 'Removes a condition from a target',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ConditionCommandOptionEnum.targetCharacter]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.targetCharacter],
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
				[ConditionCommandOptionEnum.targetCharacter]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.targetCharacter],
					1
				),
				[ConditionCommandOptionEnum.name]: withOrder(
					conditionCommandOptions[ConditionCommandOptionEnum.name],
					2
				),
				[ConditionCommandOptionEnum.severity]: withOrder(
					{
						...conditionCommandOptions[ConditionCommandOptionEnum.severity],
						required: true,
					},
					3
				),
			},
		},
	},
} satisfies CommandDefinition<ConditionSubCommandEnum>;
