import { CommandDocumentation, CommandResponseTypeEnum } from '../helpers/commands.d.js';
import {
	actionStageCommandDefinition,
	ActionStageSubCommandEnum,
} from './action-stage.command-definition.js';

export const actionStageCommandDocumentation: CommandDocumentation<
	typeof actionStageCommandDefinition
> = {
	name: 'action-stage',
	description: 'Commands for building up custom, rollable actions.',
	subCommands: {
		[ActionStageSubCommandEnum.addAttack]: {
			name: 'add-attack',
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
						['action-target']: 'Elemental Blast (1a)',
						['roll-name']: 'Attack Roll',
						['dice-roll']: '1d20 + 5',
						['defending-stat']: 'AC',
					},
				},
			],
		},
		[ActionStageSubCommandEnum.addSkillChllenge]: {
			name: 'add-skill-challenge',
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
						target: 'Battle Medicine (DC 15)',
						['roll-name']: 'Medicine Check',
						['dice-roll']: '1d20 + [medicine]',
						['target-dc']: 15,
					},
				},
			],
		},
		[ActionStageSubCommandEnum.addBasicDamage]: {
			name: 'add-basic-damage',
			description: 'Adds a basic damage roll to an action. This is a simple damage roll.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! I added a basic damage roll to the action {actionName:Elemental Blast (1a)}.',
					options: {
						target: 'Elemental Blast (1a)',
						['roll-name']: 'Elemental Blast',
						['damage-type']: 'Fire',
						['basic-damage-dice-roll']: '1d6 + 3',
					},
				},
			],
		},
		[ActionStageSubCommandEnum.addAdvacedDamage]: {
			name: 'add-advanced-damage',
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
						target: 'Shortbow Strike',
						['roll-name']: 'Shortbow Strike',
						['damage-type']: 'Piercing',
						['critical-success-dice-roll']: '(1d6)*2 + 1d10',
						['success-dice-roll']: '1d6',
					},
				},
			],
		},
		[ActionStageSubCommandEnum.addSave]: {
			name: 'add-save',
			description: 'Adds a save roll to an action. This is a roll against a DC.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I added a save roll to the action {actionName:Gale Blast}.',
					options: {
						target: 'Gale Blast',
						['roll-name']: 'Gale Blast',
						['save-roll-type']: 'Reflex',
						['ability-dc']: '[arcaneDc]',
					},
				},
			],
		},
		[ActionStageSubCommandEnum.addText]: {
			name: 'add-text',
			description: 'Adds text to an action. This is a simple text stage.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I added text to the action {actionName:Gale Blast}.',
					options: {
						target: 'Gale Blast',
						['roll-name']: 'Gale Blast',
						['default-text']:
							'The creature takes full damage and is pushed 5 feet away from you.',
						['critical-success-text']: 'The creature is unaffected.',
						['success-text']: 'The creature takes half damage.',
						['failure-text']:
							'The creature takes full damage and is pushed 5 feet away from you.',
						['critical-failure-text']:
							'The creature takes double damage and is pushed 10 feet away from you.',
						['extra-tags']: 'Air, Cantrip, Concentrate, Manipulate ',
					},
				},
			],
		},
		[ActionStageSubCommandEnum.remove]: {
			name: 'remove',
			description: 'Removes a stage from an action.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! I removed the attack roll from the action {actionName:Elemental Blast (1a)}.',
					options: {
						['target']: 'Elemental Blast (1a)',
					},
				},
			],
		},
		[ActionStageSubCommandEnum.set]: {
			name: 'set',
			description: 'Sets a stage in an action.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! I set the roll name for the action {actionName:Elemental Blast (1a)}.',
					options: {
						['target']: 'Elemental Blast (1a)',
						['edit-option']: 'rollName',
						['edit-value']: 'Elemental Blast (2a)',
					},
				},
			],
		},
	},
};
