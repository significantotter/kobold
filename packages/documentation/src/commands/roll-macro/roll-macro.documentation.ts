import { CommandDocumentation, CommandResponseTypeEnum } from '../helpers/commands.d.js';
import {
	rollMacroCommandDefinition,
	rollMacroSubCommandEnum,
} from './roll-macro.command-definition.js';
import { RollMacroCommandOptionEnum } from './roll-macro.command-options.js';

export const rollMacroCommandDocumentation: CommandDocumentation<
	typeof rollMacroCommandDefinition
> = {
	name: 'rollMacro',
	description: 'Short roll that can be referenced and used by other rolls. Case insensitive.',
	subCommands: {
		[rollMacroSubCommandEnum.list]: {
			name: rollMacroSubCommandEnum.list,
			description: 'Lists all roll macros available to your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {},
					embeds: [
						{
							title: "Ashara Keenclaw's Roll Macros",
							fields: [
								{
									name: 'ShortbowCritDamage',
									value: '(2*1d6)+d10',
								},
								{
									name: 'ShortbowDamage',
									value: 'd6',
								},
							],
						},
					],
				},
			],
		},
		[rollMacroSubCommandEnum.create]: {
			name: rollMacroSubCommandEnum.create,
			description: 'Creates a roll macro for the active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[RollMacroCommandOptionEnum.name]: 'ShortbowCritDamage',
						[RollMacroCommandOptionEnum.value]: '(2*1d6)+d10',
					},
					message:
						'Yip! I created the roll macro ShortbowCritDamage for Ashara Keenclaw.',
				},
			],
		},
		[rollMacroSubCommandEnum.set]: {
			name: rollMacroSubCommandEnum.set,
			description: 'Sets the value of a roll macro for your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[RollMacroCommandOptionEnum.name]: 'shortbowDamage',
						[RollMacroCommandOptionEnum.value]: '2d6',
					},
					embeds: [
						{
							title: "Yip! Ashara Keenclaw had their roll macro ShortbowDamage set to '2d6'.",
							fields: [],
						},
					],
				},
			],
		},
		[rollMacroSubCommandEnum.remove]: {
			name: rollMacroSubCommandEnum.remove,
			description: 'Removes a roll macro for the active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[RollMacroCommandOptionEnum.name]: 'ShortbowCritDamage',
					},
					message: 'Yip! I removed the roll macro ShortbowCritDamage.',
				},
			],
		},
	},
};

/**
 * Command Definition:
 * 
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.rollMacro.name(),
		description: L.en.commands.rollMacro.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.rollMacro.list.name(),
				description: L.en.commands.rollMacro.list.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: L.en.commands.rollMacro.create.name(),
				description: L.en.commands.rollMacro.create.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [RollMacroOptions.MACRO_NAME_OPTION, RollMacroOptions.MACRO_VALUE_OPTION],
			},
			{
				name: L.en.commands.rollMacro.set.name(),
				description: L.en.commands.rollMacro.set.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...RollMacroOptions.MACRO_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
					RollMacroOptions.MACRO_VALUE_OPTION,
				],
			},
			{
				name: L.en.commands.rollMacro.remove.name(),
				description: L.en.commands.rollMacro.remove.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...RollMacroOptions.MACRO_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
		],
 *
 * Command Options:
 * 
 * import { APIApplicationCommandStringOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class RollMacroOptions {
	public static readonly MACRO_NAME_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.rollMacroName.name(),
		description: L.en.commandOptions.rollMacroName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MACRO_VALUE_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.rollMacroValue.name(),
		description: L.en.commandOptions.rollMacroValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
 *
 * L.en.commandOptions
 * 
 * 

	rollMacroName: {
		name: 'name',
		description: 'The name of the roll macro.',
	},
	rollMacroValue: {
		name: 'value',
		description:
			'A mini-roll expression. Must be able to evaluate on its own. Ex. "5" or "d4+[str]"',
	},
 *
 * L.en.commands
 *export default {
	name: 'roll-macro',
	description: 'Short roll that can be referenced and used by other rolls. Case insensitive.',

	interactions: {
		doesntEvaluateError: 'Yip! That macro causes an error when I try to evaluate it.',
		emptyValueError: "Yip! You can't use an empty value!",
		notFound: "Yip! I couldn't find a modifier with that name.",
		requiresActiveCharacter: 'Yip! You need to have an active character to use roll macros.',
	},
	list: {
		name: 'list',
		description: 'Lists all roll macros available to your active character.',
	},
	create: {
		name: 'create',
		description: 'Creates a roll macro for the active character.',
		interactions: {
			created: 'Yip! I created the roll macro {macroName} for {characterName}.',
			alreadyExists:
				'Yip! A roll macro named {macroName} already exists for {characterName}.',
		},
	},
	set: {
		name: 'set',
		description: 'Sets the value of a roll macro for your active character.',
		interactions: {
			successEmbed: {
				title: "Yip! {characterName} had their roll macro {macroName} set to '{newMacroValue}'.",
			},
		},
	},
	remove: {
		name: 'remove',
		description: 'Removes a roll macro for the active character.',

		interactions: {
			removeConfirmation: {
				text: `Are you sure you want to remove the roll macro {macroName}?`,
				removeButton: 'REMOVE',
				cancelButton: 'CANCEL',
				expired: 'Yip! Roll Macro removal request expired.',
			},
			cancel: 'Yip! Canceled the request to remove the roll macro!',
			success: 'Yip! I removed the roll macro {macroName}.',
		},
	},
};

 *
 */
