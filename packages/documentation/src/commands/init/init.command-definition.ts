import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { CommandDefinition } from '../helpers/commands.d.js';
import { RollCommandOptionEnum, rollCommandOptions } from '../roll/roll.command-options.js';
import { InitCommandOptionEnum, initCommandOptions } from './init.command-options.js';

export enum InitSubCommandEnum {
	start = 'start',
	show = 'show',
	next = 'next',
	prev = 'prev',
	jumpTo = 'jump-to',
	join = 'join',
	add = 'add',
	note = 'note',
	set = 'set',
	remove = 'remove',
	statBlock = 'stat-block',
	roll = 'roll',
	end = 'end',
}

export const initCommandDefinition = {
	metadata: {
		name: 'init',
		description: 'Initiative Tracking',
		type: ApplicationCommandType.ChatInput,
		dm_permission: true,
		default_member_permissions: undefined,
	},
	subCommands: {
		[InitSubCommandEnum.start]: {
			name: InitSubCommandEnum.start,
			description: 'Start initiative in the current channel.',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[InitSubCommandEnum.show]: {
			name: InitSubCommandEnum.show,
			description: `Displays the current initiative order`,
			type: ApplicationCommandOptionType.Subcommand,
		},
		[InitSubCommandEnum.next]: {
			name: InitSubCommandEnum.next,
			description: `Moves to the next participant in the initiative order`,
			type: ApplicationCommandOptionType.Subcommand,
		},
		[InitSubCommandEnum.prev]: {
			name: InitSubCommandEnum.prev,
			description: `Moves to the previous participant in the initiative order`,
			type: ApplicationCommandOptionType.Subcommand,
		},
		[InitSubCommandEnum.jumpTo]: {
			name: InitSubCommandEnum.jumpTo,
			description: `Jumps to a specific participant in the initiative order`,
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[InitCommandOptionEnum.initCharacter]:
					initCommandOptions[InitCommandOptionEnum.initCharacter],
			},
		},
		[InitSubCommandEnum.join]: {
			name: InitSubCommandEnum.join,
			description:
				'Joins initiative with your active character. Defaults to rolling perception.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[RollCommandOptionEnum.skillChoice]: {
					...rollCommandOptions[RollCommandOptionEnum.skillChoice],
					description: 'The name of the skill ("perception") to use to join initiative.',
				},
				[RollCommandOptionEnum.rollExpression]: {
					...rollCommandOptions[RollCommandOptionEnum.rollExpression],
					description: 'The dice expression ("1d20+5") to use to join initiative.',
				},
				[InitCommandOptionEnum.initValue]: {
					...initCommandOptions[InitCommandOptionEnum.initValue],
					required: false,
				},
				[InitCommandOptionEnum.initHideStats]:
					initCommandOptions[InitCommandOptionEnum.initHideStats],
			},
		},
		[InitSubCommandEnum.add]: {
			name: InitSubCommandEnum.add,
			description: `Adds an NPC or minion to initiative`,
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[InitCommandOptionEnum.initCreature]: {
					...initCommandOptions[InitCommandOptionEnum.initCreature],
					required: false,
				},
				[InitCommandOptionEnum.initActor]:
					initCommandOptions[InitCommandOptionEnum.initActor],
				[RollCommandOptionEnum.rollExpression]: {
					...rollCommandOptions[RollCommandOptionEnum.rollExpression],
					description: 'The dice expression ("1d20+5") to use to join initiative.',
				},
				[InitCommandOptionEnum.initValue]: {
					...initCommandOptions[InitCommandOptionEnum.initValue],
					required: false,
				},
				[InitCommandOptionEnum.initHideStats]:
					initCommandOptions[InitCommandOptionEnum.initHideStats],
				[InitCommandOptionEnum.initCustomStats]:
					initCommandOptions[InitCommandOptionEnum.initCustomStats],
				[InitCommandOptionEnum.template]:
					initCommandOptions[InitCommandOptionEnum.template],
			},
		},
		[InitSubCommandEnum.note]: {
			name: InitSubCommandEnum.note,
			description: `Sets a note for a character in the initiative.`,
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[InitCommandOptionEnum.initCharacter]: {
					...initCommandOptions[InitCommandOptionEnum.initCharacter],
					required: false,
				},
				[InitCommandOptionEnum.initNote]:
					initCommandOptions[InitCommandOptionEnum.initNote],
			},
		},
		[InitSubCommandEnum.set]: {
			name: InitSubCommandEnum.set,
			description: `Sets certain properties of your character for initiative`,
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[InitCommandOptionEnum.initCharacter]: {
					...initCommandOptions[InitCommandOptionEnum.initCharacter],
					required: true,
				},
				[InitCommandOptionEnum.initSetOption]:
					initCommandOptions[InitCommandOptionEnum.initSetOption],
				[InitCommandOptionEnum.initSetValue]:
					initCommandOptions[InitCommandOptionEnum.initSetValue],
			},
		},
		[InitSubCommandEnum.remove]: {
			name: InitSubCommandEnum.remove,
			description: `Removes a character from the initiative`,
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[InitCommandOptionEnum.initCharacter]:
					initCommandOptions[InitCommandOptionEnum.initCharacter],
			},
		},
		[InitSubCommandEnum.statBlock]: {
			name: InitSubCommandEnum.statBlock,
			description: `Displays the statBlock for a creature in the initiative order`,
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[InitCommandOptionEnum.initCharacter]: {
					...initCommandOptions[InitCommandOptionEnum.initCharacter],
					required: true,
				},
				[RollCommandOptionEnum.rollSecret]:
					rollCommandOptions[RollCommandOptionEnum.rollSecret],
			},
		},
		[InitSubCommandEnum.roll]: {
			name: InitSubCommandEnum.roll,
			description: `Rolls dice for an initiative member that you control`,
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[InitCommandOptionEnum.initCharacter]: {
					...initCommandOptions[InitCommandOptionEnum.initCharacter],
					required: true,
				},
				[InitCommandOptionEnum.initRollChoice]: {
					...initCommandOptions[InitCommandOptionEnum.initRollChoice],
					required: true,
				},
				[InitCommandOptionEnum.initCharacterTarget]: {
					...initCommandOptions[InitCommandOptionEnum.initCharacterTarget],
					required: true,
				},
				[RollCommandOptionEnum.rollModifier]:
					rollCommandOptions[RollCommandOptionEnum.rollModifier],
				[RollCommandOptionEnum.damageRollModifier]:
					rollCommandOptions[RollCommandOptionEnum.damageRollModifier],
				[RollCommandOptionEnum.rollSecret]:
					rollCommandOptions[RollCommandOptionEnum.rollSecret],
				[RollCommandOptionEnum.rollTargetAc]:
					rollCommandOptions[RollCommandOptionEnum.rollTargetAc],
				[RollCommandOptionEnum.rollNote]:
					rollCommandOptions[RollCommandOptionEnum.rollNote],
			},
		},
		[InitSubCommandEnum.end]: {
			name: InitSubCommandEnum.end,
			description: `Ends the current initiative`,
			type: ApplicationCommandOptionType.Subcommand,
		},
	},
} satisfies CommandDefinition<InitSubCommandEnum>;

/**
 * Init command definition:
 * 
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.name(),
		description: L.en.commands.init.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.init.start.name(),
				description: L.en.commands.init.start.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: L.en.commands.init.show.name(),
				description: L.en.commands.init.show.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: L.en.commands.init.next.name(),
				description: L.en.commands.init.next.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: L.en.commands.init.prev.name(),
				description: L.en.commands.init.prev.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: L.en.commands.init.jumpTo.name(),
				description: L.en.commands.init.jumpTo.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [{ ...InitOptions.INIT_CHARACTER_OPTION, required: true }],
			},
			{
				name: L.en.commands.init.join.name(),
				description: L.en.commands.init.join.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
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
					InitOptions.INIT_HIDE_STATS_OPTION,
				],
			},
			{
				name: L.en.commands.init.add.name(),
				description: L.en.commands.init.add.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					InitOptions.INIT_CREATURE_OPTION,
					{
						...InitOptions.ACTOR_NAME_OPTION,
						required: false,
					},
					InitOptions.INIT_CUSTOM_STATS_OPTION,
					{
						...ChatArgs.ROLL_EXPRESSION_OPTION,
						description:
							L.en.commandOptions.rollExpression.overwrites.initAddDescription(),
						required: false,
					},
					{
						...InitOptions.INIT_VALUE_OPTION,
						required: false,
					},
					InitOptions.INIT_ADD_TEMPLATE_OPTION,
					InitOptions.INIT_HIDE_STATS_OPTION,
				],
			},
			{
				name: L.en.commands.init.note.name(),
				description: L.en.commands.init.note.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...InitOptions.INIT_CHARACTER_OPTION,
						required: true,
					},
					InitOptions.INIT_NOTE_OPTION,
				],
			},
			{
				name: L.en.commands.init.set.name(),
				description: L.en.commands.init.set.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...InitOptions.INIT_CHARACTER_OPTION,
						required: true,
					},
					InitOptions.ACTOR_SET_OPTION,
					InitOptions.ACTOR_SET_VALUE_OPTION,
				],
			},
			{
				name: L.en.commands.init.remove.name(),
				description: L.en.commands.init.remove.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [{ ...InitOptions.INIT_CHARACTER_OPTION, required: true }],
			},
			{
				name: L.en.commands.init.statBlock.name(),
				description: L.en.commands.init.statBlock.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...InitOptions.INIT_CHARACTER_OPTION,
						required: true,
					},
					InitOptions.INIT_STAT_BLOCK_SECRET_OPTION,
				],
			},
			{
				name: L.en.commands.init.roll.name(),
				description: L.en.commands.init.roll.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...InitOptions.INIT_CHARACTER_OPTION,
						required: true,
					},
					{
						...InitOptions.INIT_ROLL_CHOICE_OPTION,
						required: true,
					},
					{ ...InitOptions.INIT_CHARACTER_TARGET, required: true },
					{
						...ChatArgs.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...ChatArgs.DAMAGE_ROLL_MODIFIER_OPTION,
						required: false,
					},
					ChatArgs.ROLL_OVERWRITE_ATTACK_OPTION,
					ChatArgs.ROLL_OVERWRITE_SAVE_OPTION,
					ChatArgs.ROLL_OVERWRITE_DAMAGE_OPTION,
					{
						...ChatArgs.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_SECRET_OPTION,
						required: false,
					},
					ChatArgs.ROLL_TARGET_AC_OPTION,
				],
			},
			{
				name: L.en.commands.init.end.name(),
				description: L.en.commands.init.end.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
		],
	};

	 * Init command options
	import {
	APIApplicationCommandBasicOption,
	APIApplicationCommandStringOption,
	ApplicationCommandOptionType,
} from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class InitOptions {
	public static readonly INIT_VALUE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initValue.name(),
		description: L.en.commandOptions.initValue.description(),
		required: false,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly INIT_NOTE_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.initValue.name(),
		description: L.en.commandOptions.initValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_ADD_TEMPLATE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.template.name(),
		description: L.en.commandOptions.template.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.template.choices.normal.name(),
				value: L.en.commandOptions.template.choices.normal.value(),
			},
			{
				name: L.en.commandOptions.template.choices.elite.name(),
				value: L.en.commandOptions.template.choices.elite.value(),
			},
			{
				name: L.en.commandOptions.template.choices.weak.name(),
				value: L.en.commandOptions.template.choices.weak.value(),
			},
		],
	};
	public static readonly INIT_HIDE_STATS_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initHideStats.name(),
		description: L.en.commandOptions.initHideStats.description(),
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly INIT_CUSTOM_STATS_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initCustomStats.name(),
		description: L.en.commandOptions.initCustomStats.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_CHARACTER_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initCharacter.name(),
		description: L.en.commandOptions.initCharacter.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_CHARACTER_TARGET: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initCharacterTarget.name(),
		description: L.en.commandOptions.initCharacterTarget.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_STAT_BLOCK_SECRET_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollSecret.name(),
		description: L.en.commandOptions.rollSecret.description(),
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.rollSecret.choices.public.name(),
				value: L.en.commandOptions.rollSecret.choices.public.value(),
			},
			{
				name: L.en.commandOptions.rollSecret.choices.secret.name(),
				value: L.en.commandOptions.rollSecret.choices.secret.value(),
			},
		],
	};
	public static readonly INIT_TARGET_ACTOR_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initTargetActor.name(),
		description: L.en.commandOptions.initTargetActor.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_ROLL_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initRollChoice.name(),
		description: L.en.commandOptions.initRollChoice.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_CREATURE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initCreature.name(),
		description: L.en.commandOptions.initCreature.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTOR_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initActor.name(),
		description: L.en.commandOptions.initActor.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTOR_SET_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initSetOption.name(),
		description: L.en.commandOptions.initSetOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.initSetOption.choices.initiative.name(),
				value: L.en.commandOptions.initSetOption.choices.initiative.value(),
			},
			{
				name: L.en.commandOptions.initSetOption.choices.actorName.name(),
				value: L.en.commandOptions.initSetOption.choices.actorName.value(),
			},
			{
				name: L.en.commandOptions.initSetOption.choices.isGm.name(),
				value: L.en.commandOptions.initSetOption.choices.isGm.value(),
			},
			{
				name: L.en.commandOptions.initSetOption.choices.hideStats.name(),
				value: L.en.commandOptions.initSetOption.choices.hideStats.value(),
			},
		],
	};
	public static readonly ACTOR_SET_VALUE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initSetValue.name(),
		description: L.en.commandOptions.initSetValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}

		 * init related values in L.en.commandOptions

	initValue: {
		name: 'value',
		description: 'A value to set your initiative to. Overwrites any other init options.',
	},
	initNote: {
		name: 'note',
		description: 'A note displayed in the initiative tracker. "-" or "none" to remove.',
	},
	template: {
		name: 'template',
		description: 'Optionally apply a template to the added creature.',
		choices: {
			normal: {
				name: 'normal',
				value: 'normal',
			},
			elite: {
				name: 'elite',
				value: 'elite',
			},
			weak: {
				name: 'weak',
				value: 'weak',
			},
		},
	},
	initActor: {
		name: 'name',
		description: 'What to display the NPC/minion as in the initiative order.',
	},
	initCharacter: {
		name: 'character',
		description: 'A character or npc present in the initiative.',
	},
	initCharacterTarget: {
		name: 'target-character',
		description: 'The character being targeted.',
	},
	initCreature: {
		name: 'creature',
		description: 'A creature to add to the initiative.',
	},
	initHideStats: {
		name: 'hide-stats',
		description: 'Whether to hide the stats of the character/creature in the initiative.',
	},
	initCustomStats: {
		name: 'custom-stats',
		description: 'Overrides for the custom stats. In the format "hp=35;ac=20;will=7"',
	},
	initTargetActor: {
		name: 'target-initiative-member',
		description: 'Which member of the initiative to target.',
	},
	initRollChoice: {
		name: 'roll',
		description:
			'What to have that initiative member roll. Choose the initiative member first!',
	},
	initSetOption: {
		name: 'option',
		description: 'The character option to alter (only within this initiative).',
		choices: {
			initiative: {
				name: 'initiative',
				value: 'initiative',
			},
			actorName: {
				name: 'name',
				value: 'name',
			},
			isGm: {
				name: 'player-is-gm',
				value: 'player-is-gm',
			},
			hideStats: {
				name: 'hide-stats',
				value: 'hide-stats',
			},
		},
	},
	initSetValue: {
		name: 'value',
		description: 'The value to set the option to.',
	},

		 * L.en.commands.init
	export default {
	name: 'init',
	description: 'Initiative Tracking',
	interactions: {
		noActiveCharacter: "Yip! You don't have any active characters!",
	},

	// SUBCOMMANDS
	start: {
		name: 'start',
		description: 'Start initiative in the current channel.',
		expandedDescription:
			'Starts initiative in the current channel. Only one initiative can ' +
			'exist in per channel at a time. The player who creates the initiative is' +
			'marked as the GM, and can change names, add, and remove any character ' +
			'present in the initiative, not just their own.',
		interactions: {
			notServerChannelError: 'Yip! You can only start initiative in a normal server channel.',
			initExistsError:
				"Yip! There's already an initiative in this " +
				'channel. End it before you start a new one!',
			otherError: 'Yip! Something when wrong when starting your initiative!',
		},
	},
	show: {
		name: 'show',
		description: `Displays the current initiative order`,
	},
	statBlock: {
		name: 'stat-block',
		options: '[character]',
		usage: '_[character]_: The name of a character in the initiative order.',
		description: `Displays the statBlock for a creature in the initiative order`,
	},
	roll: {
		name: 'roll',
		description: `Rolls dice for an initiative member that you control`,
		options: '[character] [roll] [target-character] [*dice-roll-or-modifier*] [*secret*]',
		usage:
			'**[*character]** optional**: Which character in initiative to roll for.\n' +
			'**[roll]**: The name of the ability to roll.\n' +
			'**[target-character]**: The target character. Select (None) for no target.\n' +
			'**[*modifier*] optional**: A dice expression to modify a roll ("1d20 - 1d4 + 3"). The attack roll/save if ' +
			'the roll is an attack or action.\n' +
			'**[*damage_modifier*] optional**: A dice expression to modify a damage roll if the roll is ' +
			'an attack or action ("1d20 - 1d4 + 3").\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, or ' +
			'hide the roll, but publicly notify the channel that a roll has been made.\n' +
			'**[*overwrite-ac*] optional**: Overwrite the AC of the attack.',
		interactions: {
			noSheet:
				"Yip! That character doesn't have any creature/character data associated with it. " +
				"It's either a custom npc or wasn't imported properly",
			invalidRoll: "Yip! I couldn't find that roll on your sheet.",
		},
	},
	next: {
		name: 'next',
		description: `Moves to the next participant in the initiative order`,
	},
	prev: {
		name: 'prev',
		description: `Moves to the previous participant in the initiative order`,
	},
	jumpTo: {
		name: 'jump-to',
		options: '[character]',
		usage: '_[character]_: The name of a character in the initiative order.',
		description: `Jumps to a specific participant in the initiative order`,
	},
	note: {
		name: 'note',
		options: '[name]',
		usage:
			'_[name]_: The name of a character in the initiative.\n' +
			'_[note]_: The note to add to the character.\n' +
			'To remove a note, use any of: "-", "none", "clear", "remove", "x", or "."\n',
		description: `Sets a note for a character in the initiative.`,
		expandedDescription:
			`Sets a note for a character in the initiative.\n` +
			'To split a note over multiple lines, use "\\n" or "|" between the lines.',
	},
	join: {
		name: 'join',
		options: '[*skill*] [*dice*] [*value*] [*hide-stats*]',
		usage:
			'_[*skill*] optional_: The name of the skill ("perception") to use to join initiative.\n' +
			'_[*dice*] optional_: The dice expression ("1d20+5") to use to join initiative.\n' +
			'_[*value*] optional_: The static value ("15") to use to join initiative.' +
			"_[*hide-stats*] optional_: Whether to hide the creature's stats. Defaults to not hiding.",
		description:
			'Joins initiative with your active character. ' + 'Defaults to rolling perception.',
		expandedDescription:
			'Joins initiative with your active character. If no options are provided, ' +
			'perception is rolled for the initiative value. If multiple options are provided, only ' +
			'one will actually work. The only exception is skill + dice expression, where the ' +
			'dice expression (like "1d4") will be added onto the skill',
		interactions: {
			characterAlreadyInInit: 'Yip! {characterName} is already in this initiative!',
			joinedEmbed: {
				title: '{characterName}  joined Initiative!',
				setDescription: 'Initiative: {initValue}',
				rollDescription: 'rolled initiative!',
			},
		},
	},
	add: {
		name: 'add',
		options: '[creature] [name] [*dice*] [*value*] [*hide-stats*] [*custom-stats*]',
		usage:
			'_[creature]_: The bestiary creature. Select "Custom NPC" for a simple initiative entry with no stats.\n' +
			'_[*name*]_: The name to apply to the npc in the initiative.\n' +
			'_[*dice*] optional_: The dice expression ("1d20+5") to use to join initiative.\n' +
			'_[*value*] optional_: The static value ("15") to use to join initiative.\n' +
			"_[*hide-stats*] optional_: Whether to hide the creature's stats. Defaults to hiding." +
			'_[*custom-stats*] optional_: Custom stats for a custom npc or to overwrite on a bestiary creature. ' +
			'Enter values in the format statName=statValue, separated by semicolons. If the value is a list like with immunities, ' +
			'separate each value with a comma. For weaknesses/resistances, follow this example: ' +
			'"hp=30;ac=21;immunities=poison,electricity;fire weakness=5;cold resistance=10',
		description: `Adds an NPC or minion to initiative`,
		expandedDescription:
			'Adds a bestiary creature to the initiative. By default, the creature will ' +
			'roll initiative using its perception skill. You can alternatively ' +
			'provide a dice expression or static value to use instead. If you provide a ' +
			'custom name, it will be used instead of the creature name in the initiative. ' +
			'If you choose the "Custom NPC" option, your creature will be added with an empty stat block.',
		interactions: {
			joinedEmbed: {
				rolledTitle: '{actorName} rolled initiative!',
				joinedTitle: '{actorName} joined initiative!',
				description: 'Initiative: {finalInitiative}',
			},
		},
	},
	set: {
		name: 'set',
		options: '[name] [option] [value]',
		usage:
			'_[name]_: The name of a character in the initiative.\n' +
			'_[option]_: The property of the character to change (just for the current ' +
			'initiative!) This can be "initiative" for the initiative value, or "name" for ' +
			"the character's display name while in the initiative.\n" +
			'_[value]_: The value to set the property to.',
		description: `Sets certain properties of your character for initiative`,
		expandedDescription:
			'Sets either the initiative value or current name of the ' +
			'matching character in the initiative order. Any name changes are only reflected ' +
			"within the initiative. They don't effect the imported character elsewhere.",
		interactions: {
			invalidOptionError: 'Yip! Please send a valid option to update.',
			emptyNameError: "Yip! You can't use an empty name!",
			nameExistsError: 'Yip! A character with that name is already in the initiative.',
			initNotNumberError: 'Yip! You can only update initiative with a number.',
			successEmbed: {
				title: 'Yip! {actorName} had their {fieldToChange} set to {newFieldValue}.',
			},
		},
	},
	remove: {
		name: 'remove',
		options: '[name]',
		usage: '_[name]_: The name of a character in the initiative.',
		description: 'Removes a character from initiative.',
		expandedDescription: 'Removes the character that matches the given name from initiative',
		interactions: {
			deletedEmbed: {
				title: 'Yip! {actorName} was removed from initiative.',
			},
		},
	},
	end: {
		name: 'end',
		description: 'Ends the initiative in the current channel.',
		interactions: {
			confirmation: {
				text: 'Are you sure you want to end the initiative?',
				expired: 'Yip! The request to end the initiative expired.',
				confirmButton: 'end',
				cancelButton: 'cancel',
			},
			cancel: 'Yip! Canceled the request to end the initiative!',
			success: 'Yip! Ended the initiative!',
			error: 'Yip! Something went wrong!',
		},
	},
};

 */
