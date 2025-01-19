import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { CommandDefinition } from '../helpers/commands.d.js';
import { HelpCommandOptionEnum, helpCommandOptions } from './help.command-options.js';

export enum HelpSubCommandEnum {
	faq = 'faq',
	about = 'about',
	commands = 'commands',
	character = 'character',
	compendium = 'compendium',
	init = 'init',
	roll = 'roll',
	modifier = 'modifier',
	condition = 'condition',
	counter = 'counter',
	counterGroup = 'counter-group',
	game = 'game',
	gameplay = 'gameplay',
	attributesAndTags = 'attributes-and-tags',
	makingACustomAction = 'action-creation-walkthrough',
	rollMacro = 'roll-macro',
	action = 'action',
	actionStage = 'action-stage',
	settings = 'settings',
}

export const helpCommandDefinition = {
	metadata: {
		name: 'help',
		description: 'Get help with commands, permissions, FAQ, etc',
		type: ApplicationCommandType.ChatInput,
		dm_permission: true,
		default_member_permissions: undefined,
	},
	subCommands: {
		[HelpSubCommandEnum.faq]: {
			name: 'faq',
			description: 'Get answers to frequently asked questions',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.about]: {
			name: 'about',
			description: 'Learn about Kobold',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.commands]: {
			name: 'commands',
			description: 'Get a list of all commands',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.character]: {
			name: 'character',
			description: 'Get help with character commands',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.compendium]: {
			name: 'compendium',
			description: 'Get help with compendium commands',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.init]: {
			name: 'init',
			description: 'Get help with initiative commands',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.roll]: {
			name: 'roll',
			description: 'Get help with rolling commands',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.modifier]: {
			name: 'modifier',
			description: 'Get help with modifier commands',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.condition]: {
			name: 'condition',
			description: 'Get help with condition commands',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.counter]: {
			name: 'counter',
			description: 'Get help with counter commands',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.counterGroup]: {
			name: 'counter-group',
			description: 'Get help with counter group commands',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.game]: {
			name: 'game',
			description: 'Get help with game commands',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.gameplay]: {
			name: 'gameplay',
			description: 'Get help with gameplay commands',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.attributesAndTags]: {
			name: 'attributes-and-tags',
			description: 'Get help with attributes and tags',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.makingACustomAction]: {
			name: 'action-creation-walkthrough',
			description: 'Get help with creating a custom action',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[HelpCommandOptionEnum.customActionExample]:
					helpCommandOptions[HelpCommandOptionEnum.customActionExample],
			},
		},
		[HelpSubCommandEnum.rollMacro]: {
			name: 'roll-macro',
			description: 'Get help with roll macros',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.action]: {
			name: 'action',
			description: 'Get help with actions',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.actionStage]: {
			name: 'action-stage',
			description: 'Get help with action stages',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[HelpSubCommandEnum.settings]: {
			name: 'settings',
			description: 'Get help with settings',
			type: ApplicationCommandOptionType.Subcommand,
		},
	},
} satisfies CommandDefinition<HelpSubCommandEnum>;
