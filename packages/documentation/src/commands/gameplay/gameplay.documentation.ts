import { CommandDocumentation, CommandResponseTypeEnum } from '../helpers/commands.d.js';
import {
	gameplayCommandDefinition,
	GameplaySubCommandEnum,
} from './gameplay.command-definition.js';
import { GameplayCommandOptionEnum } from './gameplay.command-options.js';

export const gameplayCommandDocumentation: CommandDocumentation<typeof gameplayCommandDefinition> =
	{
		name: 'gameplay',
		description: "Sets a character's gameplay stat (such as hp) to a value",
		subCommands: {
			[GameplaySubCommandEnum.damage]: {
				name: GameplaySubCommandEnum.damage,
				description:
					'Applies damage to a character, effecting tempHp, stamina (if enabled), and hp.',
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						message: 'Anatase Lightclaw took 5 damage!',
						options: {
							[GameplayCommandOptionEnum.gameplayTargetCharacter]:
								'Anatase Lightclaw',
							[GameplayCommandOptionEnum.gameplayDamageAmount]: 5,
							[GameplayCommandOptionEnum.gameplayDamageType]: 'fire',
						},
					},
				],
			},
			[GameplaySubCommandEnum.set]: {
				name: GameplaySubCommandEnum.set,
				description: "Yip! I updated Anatase Lightclaw's hp from 18 to 22.",
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						message: 'Stat set successfully.',
						options: {
							[GameplayCommandOptionEnum.gameplaySetOption]: 'hp',
							[GameplayCommandOptionEnum.gameplaySetValue]: 22,
							[GameplayCommandOptionEnum.gameplayTargetCharacter]:
								'Anatase Lightclaw',
						},
					},
				],
			},
			[GameplaySubCommandEnum.recover]: {
				name: GameplaySubCommandEnum.recover,
				description:
					"Resets all of a character/npc's 'recoverable' stats (hp, stamina, resolve) to their maximum values.",
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						message: 'Yip! Anatase Lightclaw recovered! HP increased from 22 to 42',
						options: {
							[GameplayCommandOptionEnum.gameplayTargetCharacter]:
								'Anatase Lightclaw',
						},
					},
				],
			},
			[GameplaySubCommandEnum.tracker]: {
				name: GameplaySubCommandEnum.tracker,
				description:
					'Sets up a tracker to follow the changing statistics of one of your characters.',
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						message:
							'Anatase Lightclaw Tracker\n\nLevel 3 Spellscale Kobold Monk\n\nHP: `42/42`\n\nHero Points: `1/3`,',
						options: {
							[GameplayCommandOptionEnum.gameplayTargetCharacter]:
								'Anatase Lightclaw',
							[GameplayCommandOptionEnum.gameplayTargetChannel]: '#trackers',
							[GameplayCommandOptionEnum.gameplayTrackerMode]: 'full-sheet',
						},
					},
				],
			},
		},
	};

/**
 * 
	public name = L.en.commands.gameplay.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.gameplay.name(),
		description: L.en.commands.gameplay.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.gameplay.damage.name(),
				description: L.en.commands.gameplay.damage.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{ ...GameplayOptions.GAMEPLAY_TARGET_CHARACTER, required: true },
					GameplayOptions.GAMEPLAY_DAMAGE_AMOUNT,
					GameplayOptions.GAMEPLAY_DAMAGE_TYPE,
				],
			},
			{
				name: L.en.commands.gameplay.set.name(),
				description: L.en.commands.gameplay.set.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameplayOptions.GAMEPLAY_SET_OPTION,
					GameplayOptions.GAMEPLAY_SET_VALUE,
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
				],
			},
			{
				name: L.en.commands.gameplay.recover.name(),
				description: L.en.commands.gameplay.recover.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [GameplayOptions.GAMEPLAY_TARGET_CHARACTER],
			},
			{
				name: L.en.commands.gameplay.tracker.name(),
				description: L.en.commands.gameplay.tracker.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{ ...ChatArgs.SET_ACTIVE_NAME_OPTION, required: false },
					GameplayOptions.GAMEPLAY_TARGET_CHANNEL,
					GameplayOptions.GAMEPLAY_TRACKER_MODE,
				],
			},
		],
	};
 * 
 * import {
	APIApplicationCommandBasicOption,
	ApplicationCommandOptionType,
	ChannelType,
} from 'discord.js';
import L from '../../../i18n/i18n-node.js';
import { SheetBaseCounterKeys } from '@kobold/db';

export class GameplayOptions {
	public static readonly GAMEPLAY_SET_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameplaySetOption.name(),
		description: L.en.commandOptions.gameplaySetOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: Object.values(SheetBaseCounterKeys).map(key => ({
			name: L.en.commandOptions.gameplaySetOption.choices[key].name(),
			value: L.en.commandOptions.gameplaySetOption.choices[key].value(),
		})),
	};
	public static readonly GAMEPLAY_DAMAGE_AMOUNT: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameplayDamageAmount.name(),
		description: L.en.commandOptions.gameplayDamageAmount.description(),
		required: true,
		autocomplete: false,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly GAMEPLAY_DAMAGE_TYPE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameplayDamageType.name(),
		description: L.en.commandOptions.gameplayDamageType.description(),
		required: false,
		autocomplete: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly GAMEPLAY_SET_VALUE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameplaySetValue.name(),
		description: L.en.commandOptions.gameplaySetValue.description(),
		required: true,
		autocomplete: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly GAMEPLAY_TARGET_CHARACTER: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameplayTargetCharacter.name(),
		description: L.en.commandOptions.gameplayTargetCharacter.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly GAMEPLAY_TARGET_CHANNEL: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameplayTargetChannel.name(),
		description: L.en.commandOptions.gameplayTargetChannel.description(),
		required: false,
		type: ApplicationCommandOptionType.Channel,
		channel_types: [ChannelType.GuildText],
	};
	public static readonly GAMEPLAY_TRACKER_MODE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameplayTrackerMode.name(),
		description: L.en.commandOptions.gameplayTrackerMode.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.gameplayTrackerMode.choices.countersOnly.name(),
				value: L.en.commandOptions.gameplayTrackerMode.choices.countersOnly.value(),
			},
			{
				name: L.en.commandOptions.gameplayTrackerMode.choices.basicStats.name(),
				value: L.en.commandOptions.gameplayTrackerMode.choices.basicStats.value(),
			},
			{
				name: L.en.commandOptions.gameplayTrackerMode.choices.fullSheet.name(),
				value: L.en.commandOptions.gameplayTrackerMode.choices.fullSheet.value(),
			},
		],
	};
}



	gameplaySetOption: {
		name: 'option',
		description: "What option to update on the target character's sheet",
		choices: {
			hp: {
				name: 'hp',
				value: 'hp',
			},
			tempHp: {
				name: 'tempHp',
				value: 'tempHp',
			},
			stamina: {
				name: 'stamina',
				value: 'stamina',
			},
			resolve: {
				name: 'resolve',
				value: 'resolve',
			},
			heroPoints: {
				name: 'hero points',
				value: 'hero-points',
			},
			focusPoints: {
				name: 'focus points',
				value: 'focus-points',
			},
		},
	},
	gameplayDamageAmount: {
		name: 'amount',
		description: 'The amount of damage to apply. A negative number heals the target.',
	},
	gameplayDamageType: {
		name: 'type',
		description: 'The type of damage to apply.',
	},
	gameplaySetValue: {
		name: 'value',
		description: "The value to update to on the target character's sheet",
	},
	gameplayTargetCharacter: {
		name: 'target-character',
		description: 'What character to update. Defaults to your active character.',
	},
	gameplayTargetChannel: {
		name: 'target-channel',
		description: 'What channel to send the tracker to. Defaults to your current channel.',
	},
	gameSheetStyle: {
		name: 'sheet-style',
		description: 'How much information to display for each character.',
	},
	gameGiveOption: {
		name: 'what-to-give',
		description: 'What resource to give.',
		choices: {
			hp: {
				name: 'hp',
				value: 'hp',
			},
			tempHp: {
				name: 'tempHp',
				value: 'tempHp',
			},
			stamina: {
				name: 'stamina',
				value: 'stamina',
			},
			resolve: {
				name: 'resolve',
				value: 'resolve',
			},
			heroPoints: {
				name: 'hero points',
				value: 'hero-points',
			},
			focusPoints: {
				name: 'focus points',
				value: 'focus-points',
			},
		},
	},
	gameGiveAmount: {
		name: 'amount',
		description: 'How much of the resource to give.',
	},
	gameplayTrackerMode: {
		name: 'tracker-mode',
		description: 'How much information to track for the character.',
		choices: {
			countersOnly: {
				name: 'counters-only',
				value: 'counters_only',
			},
			basicStats: {
				name: 'basic-stats',
				value: 'basic_stats',
			},
			fullSheet: {
				name: 'full-sheet',
				value: 'full_sheet',
			},
		},
	},

export default {
	name: 'gameplay',
	description: 'Commands for interacting with the gameplay stats of a character or npc.',
	interactions: {},
	set: {
		name: 'set',
		description: "Sets a character's gameplay stat (such as hp) to a value",
		options: '[option] [value] [*target-character*]',
		usage:
			'[option]: The property of the character to change (on their sheet and for the current ' +
			'initiative!).\n' +
			'[value]: The value to set the property to. Can be a number that\'s 0 or higher. Put "+" or' +
			'"-" next to the number in order to increment or decrement by that value instead. If the hp ' +
			'is currently 3, then a value of 5 will set the hp to 5. If the hp is 3, then a value of +5 ' +
			'will set the hp to 8 instead\n' +
			'_[*target-character*] optional_: The target character that you control or is in the initiative. ' +
			'Defaults to your active character.',
		expandedDescription:
			'Updates a gameplay stat like hp for a character/npc.\n' +
			'Sets the stat specified in the options to the value for the target character.\n' +
			'Possible options are hp, tempHp, stamina, resolve, heroPoints, and focusPoints\n',
		interactions: {
			optionExceedsMax: 'Yip! The value you entered exceeds the maximum value for this stat.',
			optionUnderZero: 'Yip! The value you entered is less than zero.',
			optionNotANumber: 'Yip! The value you entered is not a number.',
		},
	},
	damage: {
		name: 'damage',
		description:
			'Applies damage to a character, effecting tempHp, stamina (if enabled), and hp.',
		options: '[target-character] [amount] [*type*]',
		usage:
			'[target-character]: The target character that you control or is in the initiative. ' +
			'[amount]: The amount of damage dealt. Use a negative number to heal.\n' +
			"[type]: The damage type. If specified, the target's weaknesses/resistances/immunities will be checked \n",
		expandedDescription:
			'Damages a  character/npc. Or, if given a negative number, heals them instead.\n',
	},
	recover: {
		name: 'recover',
		options: '[*target-character*]',
		usage:
			'_[*target-character*] optional_: The target character that you control or is in the initiative. ' +
			'Defaults to your active character.',
		description:
			'Resets all of a character/npc\'s "recoverable" stats (hp, stamina, resolve) to their maximum values.',
		expandedDescription: 'Recovers hp, stamina, and resolve for the target-character.\n',
	},
	tracker: {
		name: 'tracker',
		options: '[*target-character*] [*target-channel*]',
		usage:
			'_[*target-character*] optional_: The target character that you control. Defaults to your active character.' +
			'_[*target-channel*] optional_: The target channel that you have access to. Defaults to the current channel.' +
			'_[*tracker-mode*] optional_: Whether to show only counters like hp, basic stats, or a full sheet.',
		description:
			'Sets up a tracker to follow the changing statistics of one of your characters.',
		expandedDescription:
			'Sets up a tracker to follow the changing statistics of one of your characters. Only one is allowed per character.',
	},
};

 */
