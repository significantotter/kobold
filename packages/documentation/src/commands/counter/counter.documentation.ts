import { CommandDocumentation, CommandResponseTypeEnum } from '../helpers/commands.d.js';
import { counterCommandDefinition, CounterSubCommandEnum } from './counter.command-definition.js';
import { CounterCommandOptionEnum } from './counter.command-options.js';

export const counterCommandDocumentation: CommandDocumentation<typeof counterCommandDefinition> = {
	name: 'counter',
	description: 'Custom counters to track xp, per-day abilities, etc.',
	subCommands: {
		[CounterSubCommandEnum.list]: {
			name: CounterSubCommandEnum.list,
			description: 'Lists all counters available to your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {},
					embeds: [
						{
							title: "Ashara Keenclaw's Counters",
							fields: [
								{
									name: 'Spells',
									value: '**Rank 1** hydraulic push **✓**, telekinetic maneuver **✓**, runic weapon **✓**, runic weapon **✓**\n\n**Rank 2** Briny Bolt **✓**',
								},
								{
									name: 'Coinpurse',
									value: '**pp** 0\n\n**gp** 10\n\n**sp** 0\n\n**cp** 0',
								},
								{
									name: 'Focus Points',
									value: '*Refocus by studying*\n\nFocus Spells: Shooting Star\n\n◉〇',
								},
							],
						},
					],
				},
			],
		},
		[CounterSubCommandEnum.display]: {
			name: CounterSubCommandEnum.display,
			description: 'Displays a counter for your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'spells',
					},
					embeds: [
						{
							title: 'Spells',
							fields: [
								{
									name: 'Rank 1',
									value: 'hydraulic push **✓**, telekinetic maneuver **✓**, runic weapon **✓**, runic weapon **✓**',
								},
								{
									name: 'Rank 2',
									value: 'Briny Bolt **✓**',
								},
							],
						},
					],
				},
			],
		},
		[CounterSubCommandEnum.reset]: {
			name: CounterSubCommandEnum.reset,
			description: 'Resets a counter for your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'Spells',
					},
					message: "Yip! I reset Ashara Keenclaw's counter Spells.",
				},
			],
		},
		[CounterSubCommandEnum.useSlot]: {
			name: CounterSubCommandEnum.useSlot,
			description: 'Uses a prepared slot on a counter for your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'Rank 1 (Spells)',
						[CounterCommandOptionEnum.counterSlot]: 'rank 2',
					},
					embeds: [
						{
							title: 'Yip! Ashara Keenclaw used runic weapon from Spells: Rank 1.',
							fields: [
								{
									name: 'Spells',
									value: '**Rank 1** hydraulic push **✓**, telekinetic maneuver **✓**, runic weapon **✗**, runic weapon **✓**\n\n**Rank 2** Briny Bolt **✓**',
								},
							],
						},
					],
				},
			],
		},
		[CounterSubCommandEnum.value]: {
			name: CounterSubCommandEnum.value,
			description: 'Changes the value of a counter for your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'sp (Coinpurse)',
						[CounterCommandOptionEnum.counterValue]: '7',
					},
					embeds: [
						{
							title: 'Yip! I set the value of "sp" to  7.',
							fields: [
								{
									name: 'Coinpurse',
									value: '**pp** 0\n\n**gp** 10\n\n**sp** 7\n\n**cp** 0',
								},
							],
						},
					],
				},
			],
		},
		set: {
			name: CounterSubCommandEnum.set,
			description: 'Sets the value of a counter for your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'Rank 2 (Spells)',
						[CounterCommandOptionEnum.counterSetOption]: 'max',
						[CounterCommandOptionEnum.counterSetValue]: '2',
					},
					embeds: [
						{
							title: 'Yip! I set max on Rank 2 to 2.',
							fields: [
								{
									name: 'Spells',
									value: '**Rank 1** hydraulic push **✓**, telekinetic maneuver **✓**, runic weapon **✗**, runic weapon **✓**\n\n**Rank 2** Briny Bolt **✓**, empty **✓**',
								},
							],
						},
					],
				},
			],
		},
		[CounterSubCommandEnum.prepare]: {
			name: CounterSubCommandEnum.prepare,
			description: "Prepares an expendable ability in a counter's slot.",
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'Spells',
						[CounterCommandOptionEnum.counterSlot]: 'rank 2',
						[CounterCommandOptionEnum.counterPrepareSlot]: 'Telekinetic Maneuver',
					},
					embeds: [
						{
							title: 'Yip! I prepared rank 2 on Ashara Keenclaw\'s counter "Spells".',
							fields: [
								{
									name: 'Spells',
									value: '**Rank 1** hydraulic push **✓**, telekinetic maneuver **✓**, runic weapon **✗**, runic weapon **✓**\n\n**Rank 2** Briny Bolt **✓**, Telekinetic Maneuver **✓**',
								},
							],
						},
					],
				},
			],
		},
		[CounterSubCommandEnum.prepareMany]: {
			name: CounterSubCommandEnum.prepareMany,
			description: "Prepares multiple expendable abilities in a counter's slots.",
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'Spells',
						[CounterCommandOptionEnum.counterPrepareMany]: 'rank 1',
						[CounterCommandOptionEnum.counterPrepareFresh]: 'true',
					},
					embeds: [
						{
							title: 'Yip! I prepared rank 2, rank 3 on Ashara Keenclaw\'s counter "Spells".',
							fields: [
								{
									name: 'Spells',
									value: '**Rank 1** hydraulic push **✓**, telekinetic maneuver **✓**, runic weapon **✗**, runic weapon **✓**\n\n**Rank 2** Briny Bolt **✓**, Telekinetic Maneuver **✓**\n\n**Rank 3** empty **✓**, empty **✓**',
								},
							],
						},
					],
				},
			],
		},
		[CounterSubCommandEnum.create]: {
			name: CounterSubCommandEnum.create,
			description: 'Creates a counter for the active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterStyle]: 'prepared',
						[CounterCommandOptionEnum.counterName]: 'Rank 3',
						[CounterCommandOptionEnum.counterMax]: '1',
						[CounterCommandOptionEnum.counterCounterGroupName]: 'Spells',
						[CounterCommandOptionEnum.counterRecoverable]: 'True',
					},
					message: 'Yip! I created the counter Rank 3 for Ashara Keenclaw.',
				},
			],
		},
		[CounterSubCommandEnum.remove]: {
			name: CounterSubCommandEnum.remove,
			description: 'Removes a counter for the active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'Rank 3 (Spells)',
					},
					message: 'Yip! I removed the counter Rank 3.',
				},
			],
		},
	},
};

/**
 * Command Definition:
 *import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { L } from '../../../i18n/i18n-node.js';
import { CommandUtils } from '../../../utils/index.js';
import { InjectedServices } from '../../command.js';
import { Command, CommandDeferType } from '../../index.js';
import { CounterOptions } from './counter-command-options.js';

export class CounterCommand implements Command {
	public name = L.en.commands.counter.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.counter.name(),
		description: L.en.commands.counter.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.counter.list.name(),
				description: L.en.commands.counter.list.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [CounterOptions.COUNTER_LIST_HIDE_GROUPS_OPTION],
			},
			{
				name: L.en.commands.counter.useSlot.name(),
				description: L.en.commands.counter.useSlot.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterOptions.COUNTER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
					CounterOptions.COUNTER_SLOT_OPTION,
					CounterOptions.COUNTER_RESET_SLOT_OPTION,
				],
			},
			{
				name: L.en.commands.counter.value.name(),
				description: L.en.commands.counter.value.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterOptions.COUNTER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
					CounterOptions.COUNTER_VALUE_OPTION,
				],
			},
			{
				name: L.en.commands.counter.prepare.name(),
				description: L.en.commands.counter.prepare.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterOptions.COUNTER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
					CounterOptions.COUNTER_SLOT_OPTION,
					CounterOptions.COUNTER_PREPARE_SLOT_OPTION,
				],
			},
			{
				name: L.en.commands.counter.prepareMany.name(),
				description: L.en.commands.counter.prepareMany.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterOptions.COUNTER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
					CounterOptions.COUNTER_PREPARE_MANY_OPTION,
					CounterOptions.COUNTER_PREPARE_FRESH_OPTION,
				],
			},
			{
				name: L.en.commands.counter.display.name(),
				description: L.en.commands.counter.display.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterOptions.COUNTER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
			{
				name: L.en.commands.counter.create.name(),
				description: L.en.commands.counter.create.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					CounterOptions.COUNTER_STYLE_OPTION,
					CounterOptions.COUNTER_NAME_OPTION,
					CounterOptions.COUNTER_MAX_OPTION,
					CounterOptions.COUNTER_GROUP_NAME_OPTION,
					CounterOptions.COUNTER_RECOVERABLE_OPTION,
					CounterOptions.COUNTER_RECOVER_TO_OPTION,
				],
			},
			{
				name: L.en.commands.counter.set.name(),
				description: L.en.commands.counter.set.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterOptions.COUNTER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
					CounterOptions.COUNTER_SET_OPTION_OPTION,
					CounterOptions.COUNTER_SET_VALUE_OPTION,
				],
			},
			{
				name: L.en.commands.counter.reset.name(),
				description: L.en.commands.counter.reset.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterOptions.COUNTER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
			{
				name: L.en.commands.counter.remove.name(),
				description: L.en.commands.counter.remove.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterOptions.COUNTER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
		],
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	constructor(public commands: Command[]) {}

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		services: InjectedServices
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const command = CommandUtils.getSubCommandByName(
			this.commands,
			intr.options.getSubcommand()
		);
		if (!command || !command.autocomplete) {
			return;
		}

		return await command.autocomplete(intr, option, services);
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		services: InjectedServices
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const command = CommandUtils.getSubCommandByName(
			this.commands,
			intr.options.getSubcommand()
		);
		if (!command) {
			return;
		}

		let passesChecks = await CommandUtils.runChecks(command, intr);
		if (passesChecks) {
			await command.execute(intr, LL, services);
		}
	}
}
 *
 * Command Options::
 *
	counterName: {
		name: 'name',
		description: 'The name of the counter.',
	},
	counterText: {
		name: 'text',
		description: 'The text for the counter.',
	},
	counterCounterGroupName: {
		name: 'group-name',
		description: 'The name of the counter group.',
	},
	counterDescription: {
		name: 'description',
		description: 'The description of the counter.',
	},
	counterStyle: {
		name: 'style',
		description: 'The style of the counter.',
		choices: {
			prepared: { name: 'prepared', value: 'prepared' },
			default: { name: 'default', value: 'default' },
			dots: { name: 'dots', value: 'dots' },
		},
	},
	counterMax: {
		name: 'max',
		description: 'The max value of the counter.',
	},
	counterRecoverable: {
		name: 'recoverable',
		description: 'Whether the counter is reset when using the recover command.',
	},
	counterListHideGroups: {
		name: 'hide-groups',
		description: 'Whether to hide counter groups.',
	},
	counterRecoverTo: {
		name: 'recover-to',
		description: 'The value used after the recover command. -1 is max, -2 is half max.',
	},
	counterSetOption: {
		name: 'set-option',
		description: 'The field to set to a new value.',
		choices: {
			name: { name: 'name', value: 'name' },
			description: { name: 'description', value: 'description' },
			style: { name: 'style', value: 'style' },
			max: { name: 'max', value: 'max' },
			text: { name: 'text', value: 'text' },
			recoverTo: { name: 'recoverTo', value: 'recoverTo' },
			recoverable: { name: 'recoverable', value: 'recoverable' },
		},
	},
	counterSetValue: {
		name: 'value',
		description: 'The value to change the option to.',
	},
	counterSlot: {
		name: 'slot',
		description: 'The slot to use for the counter.',
	},
	counterPrepareSlot: {
		name: 'ability',
		description: "The ability to prepare in the counter's slot.",
	},
	counterPrepareMany: {
		name: 'values',
		description: 'The abilities to prepare in the counter, separated by commas.',
	},
	counterPrepareFresh: {
		name: 'prepare-fresh',
		description: 'Whether to overwrite all existing values before preparing.',
	},
	counterResetSlot: {
		name: 'reset-slot',
		description: 'Whether to reset the slot to "unused" instead of using it.',
	},
	counterValue: {
		name: 'value',
		description: 'The value to set the counter to.',
	},

 *
 * Commands:
 *export default {
	name: 'counter',
	description: 'Custom counters to track xp, per-day abilities, etc.',

	interactions: {
		invalidStyle: `Yip! The counter style {style} must be one of "prepared", "dots", or "default"!`,
		invalidForStyle: `Yip! The {parameter} option is invalid for a {style} counter!`,
		maxTooLarge: `Yip! The counter max value must be less than 20!`,
		maxTooSmall: `Yip! The counter max value must be a positive value, or -1 for no max.`,
		notFound: "Yip! I couldn't find a counter named {counterName}.",
		recoverToInvalid: `Yip! The recover to value must be a positive value, or -1 for the max value.`,
		notNumeric:
			'Yip! {counterName} is not a numeric counter. I can only adjust the value of a numeric (dots or default) counter. Use the `/counter use-slot` command to change the value of a prepared counter.',
		notPrepared:
			'Yip! {counterName} is not a prepared counter. I can only mark a slot as used from a prepared slots counter. Use the `/counter value` command to change the value of a numeric counter.',
	},
	list: {
		name: 'list',
		description: 'Lists all counters available to your active character.',
	},
	display: {
		name: 'display',
		description: 'Displays a counter for your active character.',
	},
	reset: {
		name: 'reset',
		description: 'Resets a counter for your active character.',
		interactions: {
			reset: "Yip! I reset {characterName}'s counter {counterName}.",
		},
	},
	useSlot: {
		name: 'use-slot',
		description: 'Uses a prepared slot on a counter for your active character.',
		interactions: {
			usedSlot: 'Yip! {characterName} {usedOrReset} {slotName} from {counterName}.',
		},
	},
	value: {
		name: 'value',
		description: 'Changes the value of a counter for your active character.',
		interactions: {
			adjustValue:
				'Yip! I {changeType} {changeValue} {toFrom} "{counterName}" resulting in {maxMin} {newValue}.',
			setValue: 'Yip! I set the value of "{counterName}" to {maxMin} {newValue}.',
		},
	},
	prepare: {
		name: 'prepare',
		description: "Prepares an expendable ability in a counter's slot.",
		interactions: {
			prepared: 'Yip! I prepared {slotName} on {characterName}\'s counter "{counterName}".',
		},
	},
	prepareMany: {
		name: 'prepare-many',
		description: "Prepares multiple expendable abilities in a counter's slots.",
		interactions: {
			prepared: 'Yip! I prepared {slotNames} on {characterName}\'s counter "{counterName}".',
		},
	},
	create: {
		name: 'create',
		description: 'Creates a counter for the active character.',
		interactions: {
			created: 'Yip! I created the counter {counterName} for {characterName}.',
			alreadyExists: 'Yip! A counter named {counterName} already exists for {characterName}.',
		},
	},
	set: {
		name: 'set',
		description: 'Sets the value of a counter for your active character.',
		interactions: {
			invalidOptionError: 'Yip! Please choose a valid option to set.',
			stringTooLong: "Yip! {propertyName} can't be longer than {numCharacters} characters!",
			nameExistsError: 'Yip! A counter with that name already exists.',
			successEmbed: {
				title: 'Yip! I set {propertyName} on {groupName} to {newPropertyValue}.',
			},
			invalidGroup: 'Yip! I could not find a counter group named {groupName}.',
			recoverToInvalid:
				'Yip! The recover to value must be less than the max value. Or -1 for the max value, or -2 for half the max value.',
		},
	},
	remove: {
		name: 'remove',
		description: 'Removes a counter for the active character.',

		interactions: {
			removeConfirmation: {
				text: `Are you sure you want to remove the counter {counterName}?`,
				removeButton: 'REMOVE',
				cancelButton: 'CANCEL',
				expired: 'Yip! Counter group removal request expired.',
			},
			cancel: 'Yip! Canceled the request to remove the counter!',
			success: 'Yip! I removed the counter {counterName}.',
		},
	},
};

 *
 */
