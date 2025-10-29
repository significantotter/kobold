import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import {
	ActionStageCommandOptionEnum,
	actionStageCommandOptions,
} from './action-stage.command-options.js';
import type { CommandDefinition } from '../helpers/commands.d.ts';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';

export enum ActionStageSubCommandEnum {
	addAdvancedDamage = 'add-advanced-damage',
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
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[ActionStageSubCommandEnum.addAttack]: {
			name: ActionStageSubCommandEnum.addAttack,
			description:
				"Adds an attack roll to an action. Can also be any type of roll against an enemy's DCs",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.actionTarget]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.actionTarget],
					1
				),
				[ActionStageCommandOptionEnum.rollName]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.rollName],
					2
				),
				[ActionStageCommandOptionEnum.diceRoll]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.diceRoll],
					3
				),
				[ActionStageCommandOptionEnum.defendingStat]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.defendingStat],
					4
				),
				[ActionStageCommandOptionEnum.allowModifiers]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.allowModifiers],
					5
				),
			},
		},
		[ActionStageSubCommandEnum.addSkillChallenge]: {
			name: ActionStageSubCommandEnum.addSkillChallenge,
			description:
				'Adds a skill challenge roll to an action. This is any roll against your own DCs.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.target]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.target],
					1
				),
				[ActionStageCommandOptionEnum.rollName]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.rollName],
					2
				),
				[ActionStageCommandOptionEnum.diceRoll]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.diceRoll],
					3
				),
				[ActionStageCommandOptionEnum.defendingStat]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.defendingStat],
					4
				),
				[ActionStageCommandOptionEnum.allowModifiers]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.allowModifiers],
					5
				),
			},
		},
		[ActionStageSubCommandEnum.addBasicDamage]: {
			name: ActionStageSubCommandEnum.addBasicDamage,
			description:
				'Adds a basic damage roll to an action. Automatically adjusts for crits or failures.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.target]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.target],
					1
				),
				[ActionStageCommandOptionEnum.rollName]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.rollName],
					2
				),
				[ActionStageCommandOptionEnum.basicDamageDiceRoll]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.basicDamageDiceRoll],
					3
				),
				[ActionStageCommandOptionEnum.damageType]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.damageType],
					4
				),
				[ActionStageCommandOptionEnum.allowModifiers]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.allowModifiers],
					5
				),
				[ActionStageCommandOptionEnum.healInsteadOfDamage]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.healInsteadOfDamage],
					6
				),
			},
		},
		[ActionStageSubCommandEnum.addAdvancedDamage]: {
			name: ActionStageSubCommandEnum.addAdvancedDamage,
			description:
				'Adds an advanced damage roll to an action. Requires manual input for all successes and failures.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.target]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.target],
					1
				),
				[ActionStageCommandOptionEnum.rollName]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.rollName],
					2
				),
				[ActionStageCommandOptionEnum.damageType]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.damageType],
					3
				),
				[ActionStageCommandOptionEnum.successDiceRoll]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.successDiceRoll],
					4
				),
				[ActionStageCommandOptionEnum.criticalSuccessDiceRoll]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.criticalSuccessDiceRoll],
					5
				),
				[ActionStageCommandOptionEnum.failureDiceRoll]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.failureDiceRoll],
					6
				),
				[ActionStageCommandOptionEnum.criticalFailureDiceRoll]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.criticalFailureDiceRoll],
					7
				),
				[ActionStageCommandOptionEnum.allowModifiers]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.allowModifiers],
					8
				),
				[ActionStageCommandOptionEnum.healInsteadOfDamage]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.healInsteadOfDamage],
					9
				),
			},
		},
		[ActionStageSubCommandEnum.addText]: {
			name: ActionStageSubCommandEnum.addText,
			description:
				'Adds a text block to an action. Can include dice rolls surrounded by "{{}}"',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.target]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.target],
					1
				),
				[ActionStageCommandOptionEnum.rollName]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.rollName],
					2
				),
				[ActionStageCommandOptionEnum.defaultText]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.defaultText],
					3
				),
				[ActionStageCommandOptionEnum.successText]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.successText],
					4
				),
				[ActionStageCommandOptionEnum.criticalSuccessText]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.criticalSuccessText],
					5
				),
				[ActionStageCommandOptionEnum.failureText]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.failureText],
					6
				),
				[ActionStageCommandOptionEnum.criticalFailureText]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.criticalFailureText],
					7
				),
				[ActionStageCommandOptionEnum.extraTags]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.extraTags],
					8
				),
			},
		},
		[ActionStageSubCommandEnum.addSave]: {
			name: ActionStageSubCommandEnum.addSave,
			description: 'Adds a saving throw to an action',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.target]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.target],
					1
				),
				[ActionStageCommandOptionEnum.rollName]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.rollName],
					2
				),
				[ActionStageCommandOptionEnum.saveRollType]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.saveRollType],
					3
				),
				[ActionStageCommandOptionEnum.abilityDc]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.abilityDc],
					4
				),
			},
		},
		[ActionStageSubCommandEnum.set]: {
			name: ActionStageSubCommandEnum.set,
			description: 'Sets a field on an action stage. "none" clears the field.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.target]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.target],
					1
				),
				[ActionStageCommandOptionEnum.editOption]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.editOption],
					2
				),
				[ActionStageCommandOptionEnum.editValue]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.editValue],
					3
				),
				[ActionStageCommandOptionEnum.moveOption]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.moveOption],
					4
				),
			},
		},
		[ActionStageSubCommandEnum.remove]: {
			name: ActionStageSubCommandEnum.remove,
			description: 'Removes a roll, text, or save from an action',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ActionStageCommandOptionEnum.target]: withOrder(
					actionStageCommandOptions[ActionStageCommandOptionEnum.target],
					1
				),
			},
		},
	},
} satisfies CommandDefinition<ActionStageSubCommandEnum>;
