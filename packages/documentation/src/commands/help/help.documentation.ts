import type { CommandDocumentation } from '../helpers/commands.d.ts';
import { helpCommandDefinition, HelpSubCommandEnum } from './help.command-definition.js';

export const helpCommandDocumentation: CommandDocumentation<typeof helpCommandDefinition> = {
	name: 'help',
	description: 'Get help with commands, permissions, FAQ, etc.',
	subCommands: {
		[HelpSubCommandEnum.faq]: {
			name: HelpSubCommandEnum.faq,
			description: 'Frequently Asked Questions',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.about]: {
			name: HelpSubCommandEnum.about,
			description: 'Information about the Kobold bot',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.commands]: {
			name: HelpSubCommandEnum.commands,
			description: 'All commands in Kobold',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.character]: {
			name: HelpSubCommandEnum.character,
			description: 'Help for the /character command',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.compendium]: {
			name: HelpSubCommandEnum.compendium,
			description: 'Help for the /compendium command',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.init]: {
			name: HelpSubCommandEnum.init,
			description: 'Help for the /init command',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.roll]: {
			name: HelpSubCommandEnum.roll,
			description: 'Help for the /roll command',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.modifier]: {
			name: HelpSubCommandEnum.modifier,
			description: 'Help for the /modifier command',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.condition]: {
			name: HelpSubCommandEnum.condition,
			description: 'Help for the /condition command',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.attributesAndTags]: {
			name: HelpSubCommandEnum.attributesAndTags,
			description: 'Help for character attributes and roll tags',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.game]: {
			name: HelpSubCommandEnum.game,
			description: 'help for the /game command.',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.counter]: {
			name: HelpSubCommandEnum.counter,
			description: 'help for the /counter command.',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.counterGroup]: {
			name: HelpSubCommandEnum.counterGroup,
			description: 'help for the /counter-group command.',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.gameplay]: {
			name: HelpSubCommandEnum.gameplay,
			description: 'help for the /gameplay command.',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.makingACustomAction]: {
			name: HelpSubCommandEnum.makingACustomAction,
			description: 'Help for creating a custom action',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.rollMacro]: {
			name: HelpSubCommandEnum.rollMacro,
			description: 'Help for the /roll-macro command',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.action]: {
			name: HelpSubCommandEnum.action,
			description: 'Help for the /action command',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.actionStage]: {
			name: HelpSubCommandEnum.actionStage,
			description: 'Help for the /action-stage command',
			usage: null,
			examples: [],
		},
		[HelpSubCommandEnum.settings]: {
			name: HelpSubCommandEnum.settings,
			description: 'Help for the /settings command',
			usage: null,
			examples: [],
		},
	},
};
