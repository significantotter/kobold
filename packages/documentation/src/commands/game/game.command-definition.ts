import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { CommandDefinition } from '../helpers/commands.d.js';
import { GameCommandOptionEnum, gameCommandOptions } from './game.command-options.js';
import { RollCommandOptionEnum, rollCommandOptions } from '../roll/roll.command-options.js';
import { InitCommandOptionEnum, initCommandOptions } from '../init/init.command-options.js';

export enum GameSubCommandEnum {
	manage = 'manage',
	init = 'init',
	partyStatus = 'partyStatus',
	give = 'give',
	roll = 'roll',
	list = 'list',
}

export const gameCommandDefinition = {
	metadata: {
		name: 'game',
		description: 'Commands for interacting with players as the GM of a game.',
		type: ApplicationCommandType.ChatInput,
		dm_permission: true,
		default_member_permissions: undefined,
	},
	subCommands: {
		[GameSubCommandEnum.manage]: {
			name: 'manage',
			description:
				"Manage a a GM'd group of characters. Choose to create, delete, set-active, join, kick, or leave",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameManageOption]:
					gameCommandOptions[GameCommandOptionEnum.gameManageOption],
				[GameCommandOptionEnum.gameManageValue]:
					gameCommandOptions[GameCommandOptionEnum.gameManageValue],
			},
		},
		[GameSubCommandEnum.init]: {
			name: 'init',
			description:
				'Starts initiative and adds joins with all characters in the game. GM only.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameTargetCharacter]:
					gameCommandOptions[GameCommandOptionEnum.gameTargetCharacter],
				[RollCommandOptionEnum.skillChoice]: {
					...rollCommandOptions[RollCommandOptionEnum.skillChoice],
					description: 'The skill to use for initiative instead of perception.',
					required: false,
				},
				[RollCommandOptionEnum.rollExpression]: {
					...rollCommandOptions[RollCommandOptionEnum.rollExpression],
					required: false,
				},
				[InitCommandOptionEnum.initValue]: {
					...initCommandOptions[InitCommandOptionEnum.initValue],
					required: false,
				},
			},
		},
		[GameSubCommandEnum.partyStatus]: {
			name: 'partyStatus',
			description: 'Displays the status of all party members.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameTargetCharacter]:
					gameCommandOptions[GameCommandOptionEnum.gameTargetCharacter],
				[GameCommandOptionEnum.gameSheetStyle]:
					gameCommandOptions[GameCommandOptionEnum.gameSheetStyle],
			},
		},
		[GameSubCommandEnum.give]: {
			name: 'give',
			description: 'Gives certain resources to players in the game.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameTargetCharacter]:
					gameCommandOptions[GameCommandOptionEnum.gameTargetCharacter],
				[GameCommandOptionEnum.gameGiveOption]:
					gameCommandOptions[GameCommandOptionEnum.gameGiveOption],
				[GameCommandOptionEnum.gameGiveAmount]:
					gameCommandOptions[GameCommandOptionEnum.gameGiveAmount],
			},
		},
		[GameSubCommandEnum.roll]: {
			name: 'roll',
			description: 'Rolls dice for all characters in a game (or optionally one). GM only.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameTargetCharacter]:
					gameCommandOptions[GameCommandOptionEnum.gameTargetCharacter],
				[GameCommandOptionEnum.gameRollType]:
					gameCommandOptions[GameCommandOptionEnum.gameRollType],
				[GameCommandOptionEnum.gameDiceRollOrModifier]:
					gameCommandOptions[GameCommandOptionEnum.gameDiceRollOrModifier],
				[InitCommandOptionEnum.initCharacterTarget]:
					initCommandOptions[InitCommandOptionEnum.initCharacterTarget],
				[RollCommandOptionEnum.rollSecret]:
					rollCommandOptions[RollCommandOptionEnum.rollSecret],
			},
		},
		[GameSubCommandEnum.list]: {
			name: 'list',
			description: 'Lists all of the games you have in this server.',
			type: ApplicationCommandOptionType.Subcommand,
		},
	},
} satisfies CommandDefinition<GameSubCommandEnum>;

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
