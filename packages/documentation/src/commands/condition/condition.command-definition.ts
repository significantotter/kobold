import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { CommandDefinition } from '../helpers/commands.d.js';
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
			name: ConditionSubCommandEnum.applyCustom,
			description: 'Applies a custom condition to a target',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplayTargetCharacter]:
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
				[ModifierCommandOptionEnum.name]:
					modifierCommandOptions[ModifierCommandOptionEnum.name],
				[ModifierCommandOptionEnum.severity]:
					modifierCommandOptions[ModifierCommandOptionEnum.severity],
				[ModifierCommandOptionEnum.sheetValues]:
					modifierCommandOptions[ModifierCommandOptionEnum.sheetValues],
				[ModifierCommandOptionEnum.rollAdjustment]:
					modifierCommandOptions[ModifierCommandOptionEnum.rollAdjustment],
				[ModifierCommandOptionEnum.targetTags]:
					modifierCommandOptions[ModifierCommandOptionEnum.targetTags],
				[ModifierCommandOptionEnum.type]:
					modifierCommandOptions[ModifierCommandOptionEnum.type],
				[ModifierCommandOptionEnum.description]:
					modifierCommandOptions[ModifierCommandOptionEnum.description],
				[ModifierCommandOptionEnum.initiativeNote]:
					modifierCommandOptions[ModifierCommandOptionEnum.initiativeNote],
			},
		},
		[ConditionSubCommandEnum.applyModifier]: {
			name: ConditionSubCommandEnum.applyModifier,
			description: 'Applies your existing modifier to a target as a condition',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplayTargetCharacter]:
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
				[ModifierCommandOptionEnum.name]: {
					...modifierCommandOptions[ModifierCommandOptionEnum.name],
					required: false,
				},
			},
		},
		[ConditionSubCommandEnum.list]: {
			name: ConditionSubCommandEnum.list,
			description: "Lists all of a character's conditions",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplayTargetCharacter]:
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
			},
		},
		[ConditionSubCommandEnum.set]: {
			name: ConditionSubCommandEnum.set,
			description: 'Sets a property of a condition on a target',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplayTargetCharacter]:
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
				[ConditionCommandOptionEnum.name]:
					conditionCommandOptions[ConditionCommandOptionEnum.name],
				[ModifierCommandOptionEnum.setOption]:
					modifierCommandOptions[ModifierCommandOptionEnum.setOption],
				[ModifierCommandOptionEnum.setValue]:
					modifierCommandOptions[ModifierCommandOptionEnum.setValue],
			},
		},
		[ConditionSubCommandEnum.remove]: {
			name: ConditionSubCommandEnum.remove,
			description: 'Removes a condition from a target',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplayTargetCharacter]:
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
				[ConditionCommandOptionEnum.name]:
					conditionCommandOptions[ConditionCommandOptionEnum.name],
			},
		},
		[ConditionSubCommandEnum.severity]: {
			name: ConditionSubCommandEnum.severity,
			description: 'Changes the severity of a condition on a target',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplayTargetCharacter]:
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
				[ConditionCommandOptionEnum.name]:
					conditionCommandOptions[ConditionCommandOptionEnum.name],
				[ModifierCommandOptionEnum.severity]: {
					...modifierCommandOptions[ModifierCommandOptionEnum.severity],
					required: true,
				},
			},
		},
	},
} satisfies CommandDefinition<ConditionSubCommandEnum>;
