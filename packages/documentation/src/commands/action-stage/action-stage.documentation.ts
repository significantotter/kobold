import type { CommandDocumentation } from '../helpers/commands.types.js';
import { CommandResponseTypeEnum } from '../helpers/enums.js';
import {
	actionStageCommandDefinition,
	ActionStageSubCommandEnum,
} from './action-stage.command-definition.js';
import { ActionStageCommandOptionEnum } from './action-stage.command-options.js';

export const actionStageCommandDocumentation: CommandDocumentation<
	typeof actionStageCommandDefinition
> = {
	name: 'action-stage',
	description: 'Commands for building up custom, rollable actions.',
	subCommands: {
		[ActionStageSubCommandEnum.addAttack]: {
			name: ActionStageSubCommandEnum.addAttack,
			description:
				"Adds an attack roll to an action. Can also be any type of roll against an enemy's DCs",
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! I added an attack roll to the action {actionName:Elemental Blast (1a)}.',
					options: {
						[ActionStageCommandOptionEnum.actionTarget]: 'Elemental Blast (1a)',
						[ActionStageCommandOptionEnum.rollName]: 'Attack Roll',
						[ActionStageCommandOptionEnum.diceRoll]: '1d20 + 5',
						[ActionStageCommandOptionEnum.defendingStat]: 'AC',
					},
				},
			],
		},
		[ActionStageSubCommandEnum.addSkillChallenge]: {
			name: ActionStageSubCommandEnum.addSkillChallenge,
			description:
				'Adds a skill challenge roll to an action. This is any roll against your own DCs.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! I added a skill challenge roll to the action {actionName:Battle Medicine (DC 15)}.',
					options: {
						[ActionStageCommandOptionEnum.actionTarget]: 'Battle Medicine (DC 15)',
						[ActionStageCommandOptionEnum.rollName]: 'Medicine Check',
						[ActionStageCommandOptionEnum.diceRoll]: '1d20 + [medicine]',
						[ActionStageCommandOptionEnum.defendingStat]: 15,
					},
				},
			],
		},
		[ActionStageSubCommandEnum.addBasicDamage]: {
			name: ActionStageSubCommandEnum.addBasicDamage,
			description: 'Adds a basic damage roll to an action. This is a simple damage roll.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! I added a basic damage roll to the action {actionName:Elemental Blast (1a)}.',
					options: {
						[ActionStageCommandOptionEnum.actionTarget]: 'Elemental Blast (1a)',
						[ActionStageCommandOptionEnum.rollName]: 'Elemental Blast',
						[ActionStageCommandOptionEnum.damageType]: 'Fire',
						[ActionStageCommandOptionEnum.diceRoll]: '1d6 + 3',
					},
				},
			],
		},
		[ActionStageSubCommandEnum.addAdvancedDamage]: {
			name: ActionStageSubCommandEnum.addAdvancedDamage,
			description:
				'Adds an advanced damage roll to an action. This is a more complex damage roll.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! I added an advanced damage roll to the action {actionName:Shortbow Strike}.',
					options: {
						[ActionStageCommandOptionEnum.actionTarget]: 'Shortbow Strike',
						[ActionStageCommandOptionEnum.rollName]: 'Shortbow Strike',
						[ActionStageCommandOptionEnum.damageType]: 'Piercing',
						[ActionStageCommandOptionEnum.criticalSuccessDiceRoll]: '(1d6)*2 + 1d10',
						[ActionStageCommandOptionEnum.successDiceRoll]: '1d6',
					},
				},
			],
		},
		[ActionStageSubCommandEnum.addSave]: {
			name: ActionStageSubCommandEnum.addSave,
			description: 'Adds a save roll to an action. This is a roll against a DC.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I added a save roll to the action {actionName:Gale Blast}.',
					options: {
						[ActionStageCommandOptionEnum.actionTarget]: 'Gale Blast',
						[ActionStageCommandOptionEnum.rollName]: 'Gale Blast',
						[ActionStageCommandOptionEnum.saveRollType]: 'Reflex',
						[ActionStageCommandOptionEnum.abilityDc]: '[arcaneDc]',
					},
				},
			],
		},
		[ActionStageSubCommandEnum.addText]: {
			name: ActionStageSubCommandEnum.addText,
			description: 'Adds text to an action. This is a simple text stage.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I added text to the action {actionName:Gale Blast}.',
					options: {
						[ActionStageCommandOptionEnum.actionTarget]: 'Gale Blast',
						[ActionStageCommandOptionEnum.rollName]: 'Gale Blast',
						[ActionStageCommandOptionEnum.defaultText]:
							'The creature takes full damage and is pushed 5 feet away from you.',
						[ActionStageCommandOptionEnum.criticalSuccessText]:
							'The creature is unaffected.',
						[ActionStageCommandOptionEnum.successText]:
							'The creature takes half damage.',
						[ActionStageCommandOptionEnum.failureText]:
							'The creature takes full damage and is pushed 5 feet away from you.',
						[ActionStageCommandOptionEnum.criticalFailureText]:
							'The creature takes double damage and is pushed 10 feet away from you.',
						[ActionStageCommandOptionEnum.extraTags]:
							'Air, Cantrip, Concentrate, Manipulate ',
					},
				},
			],
		},
		[ActionStageSubCommandEnum.remove]: {
			name: ActionStageSubCommandEnum.remove,
			description: 'Removes a stage from an action.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! I removed the attack roll from the action {actionName:Elemental Blast (1a)}.',
					options: {
						[ActionStageCommandOptionEnum.actionTarget]: 'Elemental Blast (1a)',
					},
				},
			],
		},
		[ActionStageSubCommandEnum.set]: {
			name: ActionStageSubCommandEnum.set,
			description: 'Sets a stage in an action.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! I set the roll name for the action {actionName:Elemental Blast (1a)}.',
					options: {
						[ActionStageCommandOptionEnum.actionTarget]: 'Elemental Blast (1a)',
						[ActionStageCommandOptionEnum.editOption]: 'rollName',
						[ActionStageCommandOptionEnum.editValue]: 'Elemental Blast (2a)',
					},
				},
			],
		},
	},
};
