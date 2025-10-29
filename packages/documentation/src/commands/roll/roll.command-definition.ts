import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.d.ts';
import { ActionCommandOptionEnum, actionCommandOptions } from '../action/action.command-options.js';
import { InitCommandOptionEnum, initCommandOptions } from '../init/init.command-options.js';
import { RollCommandOptionEnum, rollCommandOptions } from './roll.command-options.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';

export enum RollSubCommandEnum {
	action = 'action',
	attack = 'attack',
	dice = 'dice',
	perception = 'perception',
	save = 'save',
	skill = 'skill',
}

export const rollCommandDefinition = {
	metadata: {
		name: 'roll',
		description: 'Roll dice',
		type: ApplicationCommandType.ChatInput,
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[RollSubCommandEnum.action]: {
			name: RollSubCommandEnum.action,
			description: 'rolls an action for your active character',
			type: ApplicationCommandOptionType.Subcommand,
			contexts: anyUsageContext,
			options: {
				[ActionCommandOptionEnum.targetAction]: withOrder(
					{
						...actionCommandOptions[ActionCommandOptionEnum.targetAction],
						required: true,
					},
					1
				),
				[InitCommandOptionEnum.initCharacterTarget]: withOrder(
					{
						...initCommandOptions[InitCommandOptionEnum.initCharacterTarget],
						required: true,
					},
					2
				),
				[RollCommandOptionEnum.heightenLevel]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.heightenLevel],
					3
				),
				[RollCommandOptionEnum.attackRollModifier]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.attackRollModifier],
						required: false,
					},
					4
				),
				[RollCommandOptionEnum.damageRollModifier]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.damageRollModifier],
						required: false,
					},
					5
				),
				[RollCommandOptionEnum.rollOverwriteAttack]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollOverwriteAttack],
					6
				),
				[RollCommandOptionEnum.rollOverwriteSave]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollOverwriteSave],
					7
				),
				[RollCommandOptionEnum.rollOverwriteDamage]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollOverwriteDamage],
					8
				),
				[RollCommandOptionEnum.rollNote]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollNote],
						required: false,
					},
					9
				),
				[RollCommandOptionEnum.rollSecret]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollSecret],
						required: false,
					},
					10
				),
				[RollCommandOptionEnum.rollTargetDc]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollTargetDc],
					11
				),
				[RollCommandOptionEnum.rollSaveDiceRoll]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollSaveDiceRoll],
					12
				),
			},
		},
		[RollSubCommandEnum.attack]: {
			name: RollSubCommandEnum.attack,
			description: 'rolls an attack for your active character',
			type: ApplicationCommandOptionType.Subcommand,
			contexts: anyUsageContext,
			options: {
				[RollCommandOptionEnum.attackChoice]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.attackChoice],
						required: true,
					},
					1
				),
				[InitCommandOptionEnum.initCharacterTarget]: withOrder(
					{
						...initCommandOptions[InitCommandOptionEnum.initCharacterTarget],
						required: true,
					},
					2
				),
				[RollCommandOptionEnum.attackRollModifier]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.attackRollModifier],
						required: false,
					},
					3
				),
				[RollCommandOptionEnum.damageRollModifier]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.damageRollModifier],
						required: false,
					},
					4
				),
				[RollCommandOptionEnum.rollOverwriteAttack]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollOverwriteAttack],
					5
				),
				[RollCommandOptionEnum.rollOverwriteDamage]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollOverwriteDamage],
					6
				),
				[RollCommandOptionEnum.rollNote]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollNote],
						required: false,
					},
					7
				),
				[RollCommandOptionEnum.rollSecret]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollSecret],
						required: false,
					},
					8
				),
				[RollCommandOptionEnum.rollTargetAc]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollTargetAc],
					9
				),
			},
		},
		[RollSubCommandEnum.dice]: {
			name: RollSubCommandEnum.dice,
			description: 'rolls some dice',
			type: ApplicationCommandOptionType.Subcommand,
			contexts: anyUsageContext,
			options: {
				[RollCommandOptionEnum.rollExpression]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollExpression],
					1
				),
				[RollCommandOptionEnum.rollNote]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollNote],
						required: false,
					},
					2
				),
				[RollCommandOptionEnum.rollSecret]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollSecret],
						required: false,
					},
					3
				),
			},
		},
		[RollSubCommandEnum.perception]: {
			name: RollSubCommandEnum.perception,
			description: 'rolls perception for your active character',
			type: ApplicationCommandOptionType.Subcommand,
			contexts: anyUsageContext,
			options: {
				[RollCommandOptionEnum.rollModifier]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollModifier],
					1
				),
				[RollCommandOptionEnum.rollNote]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollNote],
						required: false,
					},
					2
				),
				[RollCommandOptionEnum.rollSecret]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollSecret],
						required: false,
					},
					3
				),
			},
		},
		[RollSubCommandEnum.save]: {
			name: RollSubCommandEnum.save,
			description: 'rolls a saving throw for your active character',
			type: ApplicationCommandOptionType.Subcommand,
			contexts: anyUsageContext,
			options: {
				[RollCommandOptionEnum.saveChoice]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.saveChoice],
						required: true,
					},
					1
				),
				[RollCommandOptionEnum.rollModifier]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollModifier],
						required: false,
					},
					2
				),
				[RollCommandOptionEnum.rollNote]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollNote],
						required: false,
					},
					3
				),
				[RollCommandOptionEnum.rollSecret]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollSecret],
						required: false,
					},
					4
				),
			},
		},
		[RollSubCommandEnum.skill]: {
			name: RollSubCommandEnum.skill,
			description: 'rolls a skill for your active character',
			type: ApplicationCommandOptionType.Subcommand,
			contexts: anyUsageContext,
			options: {
				[RollCommandOptionEnum.skillChoice]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.skillChoice],
						required: true,
					},
					1
				),
				[RollCommandOptionEnum.rollModifier]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollModifier],
						required: false,
					},
					2
				),
				[RollCommandOptionEnum.rollNote]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollNote],
						required: false,
					},
					3
				),
				[RollCommandOptionEnum.rollSecret]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollSecret],
						required: false,
					},
					4
				),
			},
		},
	},
} satisfies CommandDefinition<RollSubCommandEnum>;
