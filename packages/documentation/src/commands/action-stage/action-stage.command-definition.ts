import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import {
	ActionStageCommandOptionEnum,
	actionStageCommandOptions,
} from './action-stage.command-options.js';
import { CommandDefinition } from '../helpers/commands.d.js';

export enum ActionStageSubCommandEnum {
	addAdvacedDamage = 'add-advanced-damage',
	addAttack = 'add-attack',
	addBasicDamage = 'add-basic-damage',
	addSave = 'add-save',
	addSkillChallenge = 'add-skill-challenge',
	addText = 'add-text',
	remove = 'remove',
	set = 'set',
}
export const actionStageCommandDefinition = {
	metadata: {
		name: 'action-stage',
		description:
			'Commands for adding stages (rolls, text, and saves) to custom, rollable actions.',
		type: ApplicationCommandType.ChatInput,
		dm_permission: true,
		default_member_permissions: undefined,
	},
	subCommands: {
		[ActionStageSubCommandEnum.addAttack]: {
			name: ActionStageSubCommandEnum.addAttack,
			description:
				"Adds an attack roll to an action. Can also be any type of roll against an enemy's DCs",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.actionTarget]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.actionTarget],
				[ActionStageCommandOptionEnum.rollName]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.rollName],
				[ActionStageCommandOptionEnum.diceRoll]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.diceRoll],
				[ActionStageCommandOptionEnum.defendingStat]: {
					...actionStageCommandOptions[ActionStageCommandOptionEnum.defendingStat],
					autocomplete: true,
					choices: undefined,
				},
				[ActionStageCommandOptionEnum.allowModifiers]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.allowModifiers],
			},
		},
		[ActionStageSubCommandEnum.addSkillChallenge]: {
			name: ActionStageSubCommandEnum.addSkillChallenge,
			description:
				'Adds a skill challenge roll to an action. This is any roll against your own DCs.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.target]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.target],
				[ActionStageCommandOptionEnum.rollName]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.rollName],
				[ActionStageCommandOptionEnum.diceRoll]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.diceRoll],
				[ActionStageCommandOptionEnum.defendingStat]: {
					...actionStageCommandOptions[ActionStageCommandOptionEnum.defendingStat],
					autocomplete: true,
					choices: undefined,
				},
				[ActionStageCommandOptionEnum.allowModifiers]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.allowModifiers],
			},
		},
		[ActionStageSubCommandEnum.addBasicDamage]: {
			name: ActionStageSubCommandEnum.addBasicDamage,
			description:
				'Adds a basic damage roll to an action. Automatically adjusts for crits or failures.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.target]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.target],
				[ActionStageCommandOptionEnum.rollName]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.rollName],
				[ActionStageCommandOptionEnum.basicDamageDiceRoll]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.basicDamageDiceRoll],
				[ActionStageCommandOptionEnum.damageType]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.damageType],
				[ActionStageCommandOptionEnum.allowModifiers]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.allowModifiers],
				[ActionStageCommandOptionEnum.healInsteadOfDamage]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.healInsteadOfDamage],
			},
		},
		[ActionStageSubCommandEnum.addAdvacedDamage]: {
			name: ActionStageSubCommandEnum.addAdvacedDamage,
			description:
				'Adds an advanced damage roll to an action. Requires manual input for all successes and failures.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.target]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.target],
				[ActionStageCommandOptionEnum.rollName]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.rollName],
				[ActionStageCommandOptionEnum.damageType]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.damageType],
				[ActionStageCommandOptionEnum.successDiceRoll]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.successDiceRoll],
				[ActionStageCommandOptionEnum.criticalSuccessDiceRoll]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.criticalSuccessDiceRoll],
				[ActionStageCommandOptionEnum.failureDiceRoll]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.failureDiceRoll],
				[ActionStageCommandOptionEnum.criticalFailureDiceRoll]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.criticalFailureDiceRoll],
				[ActionStageCommandOptionEnum.allowModifiers]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.allowModifiers],
				[ActionStageCommandOptionEnum.healInsteadOfDamage]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.healInsteadOfDamage],
			},
		},
		[ActionStageSubCommandEnum.addText]: {
			name: ActionStageSubCommandEnum.addText,
			description:
				'Adds a text block to an action. Can include dice rolls surrounded by "{{}}"',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.target]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.target],
				[ActionStageCommandOptionEnum.rollName]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.rollName],
				[ActionStageCommandOptionEnum.defaultText]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.defaultText],
				[ActionStageCommandOptionEnum.successText]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.successText],
				[ActionStageCommandOptionEnum.criticalSuccessText]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.criticalSuccessText],
				[ActionStageCommandOptionEnum.failureText]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.failureText],
				[ActionStageCommandOptionEnum.criticalFailureText]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.criticalFailureText],
				[ActionStageCommandOptionEnum.extraTags]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.extraTags],
			},
		},
		[ActionStageSubCommandEnum.addSave]: {
			name: ActionStageSubCommandEnum.addSave,
			description: 'Adds a saving throw to an action',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.target]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.target],
				[ActionStageCommandOptionEnum.rollName]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.rollName],
				[ActionStageCommandOptionEnum.saveRollType]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.saveRollType],
				[ActionStageCommandOptionEnum.abilityDc]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.abilityDc],
			},
		},
		[ActionStageSubCommandEnum.set]: {
			name: ActionStageSubCommandEnum.set,
			description: 'Sets a field on an action stage. "none" clears the field.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.target]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.target],
				[ActionStageCommandOptionEnum.editOption]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.editOption],
				[ActionStageCommandOptionEnum.editValue]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.editValue],
				[ActionStageCommandOptionEnum.moveOption]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.moveOption],
			},
		},
		[ActionStageSubCommandEnum.remove]: {
			name: ActionStageSubCommandEnum.remove,
			description: 'Removes a roll, text, or save from an action',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.target]:
					actionStageCommandOptions[ActionStageCommandOptionEnum.target],
			},
		},
	},
} satisfies CommandDefinition<ActionStageSubCommandEnum>;
