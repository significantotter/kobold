import { ActionCommandOptionEnum } from '../action/action.command-options.js';
import type { CommandDocumentation } from '../helpers/commands.types.js';
import { CommandResponseTypeEnum } from '../helpers/enums.js';
import { InitCommandOptionEnum } from '../init/init.command-options.js';
import { rollCommandDefinition, RollSubCommandEnum } from './roll.command-definition.js';
import { RollCommandOptionEnum } from './roll.command-options.js';

export const rollCommandDocumentation: CommandDocumentation<typeof rollCommandDefinition> = {
	name: 'roll',
	description: 'Roll dice',
	subCommands: {
		[RollSubCommandEnum.action]: {
			name: RollSubCommandEnum.action,
			description: 'Roll an action for your active character',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[ActionCommandOptionEnum.targetAction]: 'Flying Flame',
					},
					embeds: [
						{
							title: 'Lilac Sootsnout used Flying Flame!',
							fields: [
								{
									name: 'Details',
									value: 'A Tiny shape of flame appears, taking a form of your choice— such as a bird, an arrow, or a simple sphere. It Flies from you up to 30 feet in a path you choose. Each creature it passes through saves against the following damage. A creature attempts only one save, even if the flame passes through it multiple times.',
								},
								{
									name: 'DC 26 Reflex check VS. Class DC. Failure!',
									value: 'd20+8\n\n[15] + 8\n\ntotal = 23',
								},
								{
									name: 'Damage',
									value: '1d8 + (floor((8-1)/2))d8 + "inspire courage" 1\n\n[1] + [3, 2, 3] + 1\n\ntotal = 10',
								},
							],
						},
					],
				},
			],
		},
		[RollSubCommandEnum.attack]: {
			name: RollSubCommandEnum.attack,
			description: 'Roll an attack for your active character',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[RollCommandOptionEnum.attackChoice]: 'special unarmed falling stone',
						[InitCommandOptionEnum.initCharacterTarget]: 'Kobold Wizard',
						[RollCommandOptionEnum.rollOverwriteAttack]: '20',
						[RollCommandOptionEnum.rollOverwriteDamage]: '5',
						[RollCommandOptionEnum.rollTargetAc]: '18',
					},
					embeds: [
						{
							title: 'Anatase Lightclaw used special unarmed falling stone on Kobold Wizard!',
							fields: [
								{
									name: 'To Hit',
									value: '20',
								},
								{
									name: 'Damage',
									value: '5',
								},
								{
									name: 'Kobold Wizard took damage from Anatase Lightclaw',
									value: "Kobold Wizard took 5 damage from Anatase Lightclaw's special unarmed falling stone!",
								},
							],
						},
					],
				},
			],
		},
		[RollSubCommandEnum.dice]: {
			name: RollSubCommandEnum.dice,
			description: 'Roll some dice',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[RollCommandOptionEnum.rollExpression]: '1d20 - 1d4 + 3',
						[RollCommandOptionEnum.rollNote]: 'I rolled some dice!',
						[RollCommandOptionEnum.rollSecret]: 'public',
					},
					embeds: [
						{
							title: 'significantotter rolled some dice!',
							description: '1d20 - 1d4 + 3\n\n[20] - [1] + 3\n\ntotal = 22',
							footer: 'I rolled some dice!',
							fields: [],
						},
					],
				},
				{
					title: '2d20 keeping highest',
					type: CommandResponseTypeEnum.success,
					options: {
						[RollCommandOptionEnum.rollExpression]: '2d20kh1 + 4',
					},
					embeds: [
						{
							title: 'significantotter rolled some dice!',
							description: '2d20kh1 + 4\n\n[14, 1] + 4\n\ntotal = 18',
							fields: [],
						},
					],
				},
			],
		},
		[RollSubCommandEnum.perception]: {
			name: RollSubCommandEnum.perception,
			description: 'Roll perception for your active character',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {},
					embeds: [
						{
							title: 'Anatase Lightclaw rolled Perception',
							description: 'd20+7\n\n[5] + 7\n\ntotal = 12',
							footer: 'tags: skill, perception',
							fields: [],
						},
					],
				},
			],
		},
		[RollSubCommandEnum.save]: {
			name: RollSubCommandEnum.save,
			description: 'Roll a save for your active character',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[RollCommandOptionEnum.saveChoice]: 'Reflex',
					},
					embeds: [
						{
							title: 'Anatase Lightclaw rolled Will',
							description: 'd20+9\n\n[2] + 9\n\ntotal = 11',
							footer: 'tags: save, will, wisdom',
							fields: [],
						},
					],
				},
			],
		},
		[RollSubCommandEnum.skill]: {
			name: RollSubCommandEnum.skill,
			description: 'Roll a skill for your active character',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[RollCommandOptionEnum.skillChoice]: 'Athletics',
						[RollCommandOptionEnum.rollModifier]: '1',
						[RollCommandOptionEnum.rollNote]: 'Grapple check',
						[RollCommandOptionEnum.rollSecret]: 'public',
					},
					embeds: [
						{
							title: 'Anatase Lightclaw rolled Athletics',
							description: 'd20+12\n\n[12] + 12\n\ntotal = 24',
							footer: 'Grapple Check\n\nAthletics tags: skill, athletics, strength',
							fields: [],
						},
					],
				},
			],
		},
	},
};
