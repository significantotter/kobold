import { CommandDocumentation, CommandResponseTypeEnum } from '../helpers/commands.d.js';
import { RollCommandOptionEnum } from '../roll/roll.command-options.js';
import { gameCommandDefinition, GameSubCommandEnum } from './game.command-definition.js';
import { GameCommandOptionEnum } from './game.command-options.js';

export const gameCommandDocumentation: CommandDocumentation<typeof gameCommandDefinition> = {
	name: 'game',
	description: 'Commands for interacting with players as the GM of a game.',
	subCommands: {
		[GameSubCommandEnum.manage]: {
			name: GameSubCommandEnum.manage,
			description: 'The different commands to manage a game.',
			usage: null,
			examples: [
				{
					title: 'Create a game',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I created the game "Season of Ghosts" in this server.',
					options: {
						[GameCommandOptionEnum.gameManageOption]: 'create',
						[GameCommandOptionEnum.gameManageValue]: 'Season of Ghosts',
					},
				},
				{
					title: 'Set a game as active',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! I set the game "Season of Ghosts" as your active game in this server.',
					options: {
						[GameCommandOptionEnum.gameManageOption]: 'set-active',
						[GameCommandOptionEnum.gameManageValue]: 'Season of Ghosts',
					},
				},
				{
					title: 'Delete a game',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I deleted the game "Season of Ghosts" in this server.',
					options: {
						[GameCommandOptionEnum.gameManageOption]: 'delete',
						[GameCommandOptionEnum.gameManageValue]: 'Season of Ghosts',
					},
				},
				{
					title: 'Kick a character',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I kicked Lilac Sootsnout out of the game "Season of Ghosts"!',
					options: {
						[GameCommandOptionEnum.gameManageOption]: 'kick',
						[GameCommandOptionEnum.gameManageValue]:
							'Season of Ghosts - Lilac Sootsnout',
					},
				},
				{
					title: 'Join a game',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! Lilac Sootsnout joined the game "Season of Ghosts"!',
					options: {
						[GameCommandOptionEnum.gameManageOption]: 'join',
						[GameCommandOptionEnum.gameManageValue]: 'Season of Ghosts',
					},
				},
				{
					title: 'Leave a game',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! Lilac Sootsnout left the game "Season of Ghosts"!',
					options: {
						[GameCommandOptionEnum.gameManageOption]: 'leave',
						[GameCommandOptionEnum.gameManageValue]: 'Season of Ghosts',
					},
				},
			],
		},
		[GameSubCommandEnum.init]: {
			name: GameSubCommandEnum.init,
			description:
				'Starts an initiative and adds joins with all characters in the game. GM only.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[GameCommandOptionEnum.gameTargetCharacter]: 'Lilac Sootsnout',
						[RollCommandOptionEnum.skillChoice]: 'Society',
					},
					embeds: [
						{
							title: 'Lilac Sootsnout joined Initiative!',
							description:
								'd20+8 + "incredible initiative" 2\n\n[14] + 8 + 2\n\ntotal = 24',
							fields: [],
							footer: 'tags: initiative, skill, society, intelligence',
						},
						{
							title: 'Anatase Lightclaw joined Initiative!',
							description: 'd20+7\n\n[12] + 7\n\ntotal = 19',
							fields: [],
							footer: 'tags: initiative, skill, society, intelligence',
						},
						{
							title: 'Initiative Round 0',
							description:
								'```  24: Lilac Sootsnout <HP 91/102>\n\n.     Clumsy 1\n\n  19: Anatase Lightclaw <HP 23/42>\n\n  6: Kobold Cavern Mage <HEALTHY>\n\n.     Immune to visual. All terrain difficult.```',
							fields: [],
						},
					],
				},
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: { gameTargetCharacter: 'All Players' },
					message: 'Yip! All the characters in your game were already in the initiative!',
				},
			],
		},
		[GameSubCommandEnum.partyStatus]: {
			name: GameSubCommandEnum.partyStatus,
			description: 'Displays the status of all party members.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[GameCommandOptionEnum.gameTargetCharacter]: 'All Players',
					},
					embeds: [
						{
							title: 'Party Status',
							fields: [
								{
									name: 'Lilac Sootsnout',
									value: 'Lilac Sootsnout Sheet Level 8 Ganzi Kobold Kineticist\n\nHP: `91/102`\n\nHero Points: `3/3`, Focus Points: `1/2`',
								},
								{
									name: 'Anatase Lightclaw',
									value: 'Anatase Lightclaw Sheet Level 3 Spellscale Kobold Monk\n\nHP: `23/42`\n\nHero Points: `1/3`,',
								},
							],
						},
					],
				},
			],
		},
		[GameSubCommandEnum.give]: {
			name: GameSubCommandEnum.give,
			description: 'Gives certain resources to players in the game.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[GameCommandOptionEnum.gameTargetCharacter]: 'Lilac Sootsnout',
						[GameCommandOptionEnum.gameGiveOption]: 'hero points',
						[GameCommandOptionEnum.gameGiveAmount]: '1',
					},
					message: 'Yip! I gave 1 hero point(s) to Lilac Sootsnout! New total: 2/3',
				},
			],
		},
		[GameSubCommandEnum.roll]: {
			name: GameSubCommandEnum.roll,
			description: 'Rolls dice for all characters in a game (or optionally one). GM only.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[GameCommandOptionEnum.gameTargetCharacter]: 'All Players',
						[GameCommandOptionEnum.gameRollType]: 'reflex',
					},
					embeds: [
						{
							title: 'Lilac Sootsnout rolled Reflex',
							description: 'd20+16\n\n[9] + 16\n\ntotal = `25`',
							fields: [],
							footer: 'tags: save, reflex, dexterity',
						},
						{
							title: 'Anatase Lightclaw rolled Reflex',
							description: 'd20+8\n\n[14] + 8\n\ntotal = `22`',
							fields: [],
							footer: 'tags: save, reflex, dexterity',
						},
					],
				},
			],
		},
		[GameSubCommandEnum.list]: {
			name: GameSubCommandEnum.list,
			description: 'Lists all of the games you have in this server.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Games you run in this server',
					options: {},
					embeds: [
						{
							title: 'Games you run in this server',
							fields: [
								{
									name: 'Season of Ghosts (active)',
									value: 'Lilac Sootsnout\n\nAnatase Lightclaw',
								},
								{
									name: 'Gatewalkers',
									value: 'No characters added.',
								},
							],
						},
					],
				},
			],
		},
	},
};

/**
 * 
 * 
 * import { APIApplicationCommandStringOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';
import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';
import { SheetBaseCounterKeys } from '@kobold/db';

export class GameOptions {
	public static readonly GAME_GIVE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameGiveOption.name(),
		description: L.en.commandOptions.gameGiveOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: Object.values(SheetBaseCounterKeys).map(key => ({
			name: L.en.commandOptions.gameGiveOption.choices[key].name(),
			value: L.en.commandOptions.gameGiveOption.choices[key].value(),
		})),
	};
	public static readonly GAME_GIVE_AMOUNT: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameGiveAmount.name(),
		description: L.en.commandOptions.gameGiveAmount.description(),
		required: true,
		autocomplete: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly GAME_SHEET_STYLE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameSheetStyle.name(),
		description: L.en.commandOptions.gameSheetStyle.description(),
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
	public static readonly GAME_MANAGE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameManageOption.name(),
		description: L.en.commandOptions.gameManageOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.gameManageOption.choices.create.name(),
				value: L.en.commandOptions.gameManageOption.choices.create.value(),
			},
			{
				name: L.en.commandOptions.gameManageOption.choices.join.name(),
				value: L.en.commandOptions.gameManageOption.choices.join.value(),
			},
			{
				name: L.en.commandOptions.gameManageOption.choices.setActive.name(),
				value: L.en.commandOptions.gameManageOption.choices.setActive.value(),
			},
			{
				name: L.en.commandOptions.gameManageOption.choices.leave.name(),
				value: L.en.commandOptions.gameManageOption.choices.leave.value(),
			},
			{
				name: L.en.commandOptions.gameManageOption.choices.kick.name(),
				value: L.en.commandOptions.gameManageOption.choices.kick.value(),
			},
			{
				name: L.en.commandOptions.gameManageOption.choices.delete.name(),
				value: L.en.commandOptions.gameManageOption.choices.delete.value(),
			},
		],
	};
	public static readonly GAME_MANAGE_VALUE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameManageValue.name(),
		description: L.en.commandOptions.gameManageValue.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly GAME_ROLL_TYPE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameRollType.name(),
		description: L.en.commandOptions.gameRollType.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly GAME_TARGET_CHARACTER: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameTargetCharacter.name(),
		description: L.en.commandOptions.gameTargetCharacter.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly GAME_DICE_ROLL_OR_MODIFIER: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.gameDiceRollOrModifier.name(),
		description: L.en.commandOptions.gameDiceRollOrModifier.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
}



 * Command definition:
 * 
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.game.name(),
		description: L.en.commands.game.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.game.manage.name(),
				description: L.en.commands.game.manage.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [GameOptions.GAME_MANAGE_OPTION, GameOptions.GAME_MANAGE_VALUE],
			},
			{
				name: L.en.commands.game.init.name(),
				description: L.en.commands.game.init.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameOptions.GAME_TARGET_CHARACTER,
					{
						...ChatArgs.SKILL_CHOICE_OPTION,
						description:
							L.en.commandOptions.skillChoice.overwrites.initJoinDescription(),
						required: false,
					},
					{
						...ChatArgs.ROLL_EXPRESSION_OPTION,
						description:
							'Dice to roll to join initiative. ' +
							'Modifies your skill if you chose a skill.',
						required: false,
					},
					{
						...InitOptions.INIT_VALUE_OPTION,
						required: false,
					},
				],
			},
			{
				name: L.en.commands.game.partyStatus.name(),
				description: L.en.commands.game.partyStatus.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [GameOptions.GAME_TARGET_CHARACTER, GameOptions.GAME_SHEET_STYLE],
			},
			{
				name: L.en.commands.game.give.name(),
				description: L.en.commands.game.give.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameOptions.GAME_TARGET_CHARACTER,
					GameOptions.GAME_GIVE_OPTION,
					GameOptions.GAME_GIVE_AMOUNT,
				],
			},
			{
				name: L.en.commands.game.roll.name(),
				description: L.en.commands.game.roll.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameOptions.GAME_TARGET_CHARACTER,
					GameOptions.GAME_ROLL_TYPE,
					GameOptions.GAME_DICE_ROLL_OR_MODIFIER,
					{ ...InitOptions.INIT_CHARACTER_TARGET, required: false },
					ChatArgs.ROLL_SECRET_OPTION,
				],
			},
			{
				name: L.en.commands.game.list.name(),
				description: L.en.commands.game.list.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [],
			},
		],
	
	 * Command option definitions:

	gameManageOption: {
		name: 'manage-option',
		description: 'What you want to do to manage a game',
		choices: {
			create: {
				name: 'create',
				value: 'create',
			},
			join: {
				name: 'join',
				value: 'join',
			},
			setActive: {
				name: 'set-active',
				value: 'set-active',
			},
			leave: {
				name: 'leave',
				value: 'leave',
			},
			kick: {
				name: 'kick',
				value: 'kick',
			},
			delete: {
				name: 'delete',
				value: 'delete',
			},
		},
	},
	gameManageValue: {
		name: 'manage-value',
		description:
			'Enter the name of the game if creating, otherwise pick between possible choices for the action.',
	},
	gameTargetCharacter: {
		name: 'game-target-character',
		description: 'Rolls for a single character instead of all characters.',
	},
	gameRollType: {
		name: 'game-roll-type',
		description: 'The type of roll for the characters to make',
	},
	gameDiceRollOrModifier: {
		name: 'dice-roll-or-modifier',
		description: 'the dice roll if doing a custom roll, or a modifier to add to the roll.',
	},

	// Command definitions:
	export default {
	name: 'game',
	description: 'Commands for interacting with players as the GM of a game.',
	interactions: {
		notFound: "Yip! I couldn't find the game {gameName} in this server.",
		noGames: 'Yip! You have no games yet on this server.',
		activeGameNotFound:
			"Yip! I couldn't find a game that you run in this server that you've set to active!",
	},
	manage: {
		name: 'manage',
		description:
			"Manage a a GM'd group of characters. Choose to create, delete, set-active, join, kick, or leave",
		expandedDescription:
			'Manage a game.\n' +
			'`/game manage [create] [game name]`\ncreates a game named "game name" in this discord server.\n' +
			'`/game manage [delete] [game name]`\ndeletes the game named "game name".\n' +
			'`/game manage [set-active] [game name]`\nsets the game "game name" as active for your /game commands.\n' +
			'`/game manage [join] [game name]`\njoins the game named "game name" with your active character\n' +
			'`/game manage [kick] [game name - character name]`\nkicks the character from the specified game.\n' +
			'`/game manage [leave] [game name]`\nleaves the game "game name" with your active character.',
		interactions: {
			gameAlreadyExists: 'Yip! A game with that name already exists in this server.',
			gameNameTooShort: "Yip! Your game's name needs to be at least 2 characters!",
			gameNameDisallowedCharacters:
				'Yip! Your game\'s name can\'t include " - ".' +
				' I use that to separate games from characters when kicking a character!',
			createSuccess: 'Yip! I created the game "{gameName}" in this server.',
			setActiveSuccess:
				'Yip! I set the game "{gameName}" as your active game in this server.',
			deleteSuccess: 'Yip! I deleted the game "{gameName}" in this server.',
			kickSuccess: 'Yip! I kicked {characterName} out of the game "{gameName}"!',
			kickParseFailed:
				"Yip! I couldn't tell the game and character apart! Try using one of the suggested options.",
			characterNotInGame:
				'Yip! I couldn\'t find the character {characterName} in the game "{gameName}"!',
			joinSuccess: 'Yip! {characterName} joined the game "{gameName}"!',
			leaveSuccess: 'Yip! {characterName} left the game "{gameName}"!',
		},
	},
	partyStatus: {
		name: 'party-status',
		usage:
			'**[*game-target-character*]**: Restricts the roll to one or all specified character.\n' +
			'_[*sheet-style*] optional_: Whether to show only counters like hp, basic stats, or a full sheet.',
		description: 'Displays the status of all party members.',
	},
	give: {
		name: 'give',
		usage:
			'**[*game-target-character*]**: Restricts the roll to one or all specified character.\n' +
			'[option]: The type of resource to give of (eg. hp, hero points, etc).\n' +
			'[amount]: The amount to give. Put "-" before to take the amount away',
		description: 'Gives certain resources to players in the game.',
	},
	init: {
		name: 'init',
		description:
			'Starts an initiative and adds joins with all characters in the game. GM only.',
		interactions: {
			alreadyInInit: 'Yip! All the characters in your game were already in the initiative!',
		},
	},
	roll: {
		name: 'roll',
		description: 'Rolls dice for all characters in a game (or optionally one). GM only.',
		options: '[game-roll-type] [*dice-roll-or-modifier*] [*game-target-character*] [*secret*]',
		usage:
			'**[*game-target-character*]**: Restricts the roll to one or all specified character.\n' +
			'**[game-roll-type]**: The name of the ability to roll.\n' +
			'**[*dice-roll-or-modifier*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to the end ' +
			'of the roll if choosing a skill/ability/save. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[target-character] optional**: The target character for an attack or action. Select (None) for no target.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, ' +
			'hide the roll, but publicly notify the channel that a roll has been made, or send the roll to your gm.',
	},
	list: {
		name: 'list',
		description: 'Lists all of the games you have in this server.',
		interactions: {
			gameListEmbed: {
				title: 'Games you run in this server',
				noCharacters: 'No characters added.',
			},
		},
	},
};

 */
