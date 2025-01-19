import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.js';

export enum RollCommandOptionEnum {
	rollExpression = 'dice',
	rollOverwriteAttack = 'overwrite-attack-roll',
	rollOverwriteSave = 'overwrite-save-roll',
	rollOverwriteDamage = 'overwrite-damage-roll',
	rollSecret = 'secret',
	skillChoice = 'skill',
	saveChoice = 'save',
	attackChoice = 'attack',
	rollModifier = 'modifier',
	attackRollModifier = 'attack_modifier',
	damageRollModifier = 'damage_modifier',
	heightenLevel = 'heighten',
	rollTargetDc = 'overwrite-dc',
	rollTargetAc = 'overwrite-ac',
	rollSaveDiceRoll = 'overwrite-save-dice-roll',
	rollNote = 'note',
}

export const rollCommandOptions: CommandOptions = {
	[RollCommandOptionEnum.rollExpression]: {
		name: 'dice',
		description: 'The dice expression to roll. Similar to Roll20 dice rolls.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.rollOverwriteAttack]: {
		name: 'overwrite-attack-roll',
		description: 'An alternate attack roll replacing all attack rolls',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.rollOverwriteSave]: {
		name: 'overwrite-save-roll',
		description: 'An alternate save roll replacing all save rolls',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.rollOverwriteDamage]: {
		name: 'overwrite-damage-roll',
		description: 'An alternate damage roll replacing the FIRST damage roll.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.rollSecret]: {
		name: 'secret',
		description: 'Whether to send the roll in a hidden, temporary message.',
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'public',
				value: 'public',
			},
			{
				name: 'secret',
				value: 'secret',
			},
			{
				name: 'secret-and-notify',
				value: 'secret-and-notify',
			},
			{
				name: 'send-to-gm',
				value: 'send-to-gm',
			},
		],
	},
	[RollCommandOptionEnum.skillChoice]: {
		name: 'skill',
		description: 'The skill to roll.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.saveChoice]: {
		name: 'save',
		description: 'The save to roll.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.attackChoice]: {
		name: 'attack',
		description: 'The attack to roll.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.rollModifier]: {
		name: 'modifier',
		description: 'A dice expression to modify your roll. (e.g. "+ 1 + 1d4")',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.attackRollModifier]: {
		name: 'attack_modifier',
		description: 'A dice expression to modify your attack roll. (e.g. "+ 1 + 1d4")',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.damageRollModifier]: {
		name: 'damage_modifier',
		description: 'A dice expression to modify your damage roll. (e.g. "+ 1 + 1d4")',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.heightenLevel]: {
		name: 'heighten',
		description: 'The level to heighten the action to.',
		required: false,
		type: ApplicationCommandOptionType.Integer,
	},
	[RollCommandOptionEnum.rollNote]: {
		name: 'note',
		description: 'A note about the reason for the roll.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.rollTargetDc]: {
		name: 'overwrite-dc',
		description: 'Provide a custom DC to roll attacks against.',
		required: false,
		type: ApplicationCommandOptionType.Integer,
	},
	[RollCommandOptionEnum.rollTargetAc]: {
		name: 'overwrite-ac',
		description: 'Provide a custom AC to roll the attack against.',
		required: false,
		type: ApplicationCommandOptionType.Integer,
	},
	[RollCommandOptionEnum.rollSaveDiceRoll]: {
		name: 'overwrite-save-dice-roll',
		description: 'Provide the dice roll to use for any saving throw in the action.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<RollCommandOptionEnum>;

/**
 * Command Definition:
 *
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.roll.name(),
		description: L.en.commands.roll.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.roll.action.name(),
				description: L.en.commands.roll.action.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ActionOptions.ACTION_TARGET_OPTION,
						required: true,
					},
					{ ...InitOptions.INIT_CHARACTER_TARGET, required: true },
					RollOptions.HEIGHTEN_LEVEL_OPTION,
					{
						...RollOptions.ATTACK_ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...RollOptions.DAMAGE_ROLL_MODIFIER_OPTION,
						required: false,
					},
					RollOptions.ROLL_OVERWRITE_ATTACK_OPTION,
					RollOptions.ROLL_OVERWRITE_SAVE_OPTION,
					RollOptions.ROLL_OVERWRITE_DAMAGE_OPTION,
					{
						...RollOptions.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_SECRET_OPTION,
						required: false,
					},
					RollOptions.ROLL_TARGET_DC_OPTION,
					RollOptions.ROLL_SAVE_DICE_ROLL_OPTION,
				],
			},
			{
				name: L.en.commands.roll.attack.name(),
				description: L.en.commands.roll.attack.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...RollOptions.ATTACK_CHOICE_OPTION,
						required: true,
					},
					{ ...InitOptions.INIT_CHARACTER_TARGET, required: true },
					{
						...RollOptions.ATTACK_ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...RollOptions.DAMAGE_ROLL_MODIFIER_OPTION,
						required: false,
					},
					RollOptions.ROLL_OVERWRITE_ATTACK_OPTION,
					RollOptions.ROLL_OVERWRITE_DAMAGE_OPTION,
					{
						...RollOptions.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_SECRET_OPTION,
						required: false,
					},
					RollOptions.ROLL_TARGET_AC_OPTION,
				],
			},
			{
				name: L.en.commands.roll.dice.name(),
				description: L.en.commands.roll.dice.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...RollOptions.ROLL_EXPRESSION_OPTION,
						required: true,
					},
					{
						...RollOptions.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_SECRET_OPTION,
						required: false,
					},
				],
			},
			{
				name: L.en.commands.roll.perception.name(),
				description: L.en.commands.roll.perception.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...RollOptions.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_SECRET_OPTION,
						required: false,
					},
				],
			},
			{
				name: L.en.commands.roll.save.name(),
				description: L.en.commands.roll.save.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...RollOptions.SAVE_CHOICE_OPTION,
						required: true,
					},
					{
						...RollOptions.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_SECRET_OPTION,
						required: false,
					},
				],
			},
			{
				name: L.en.commands.roll.skill.name(),
				description: L.en.commands.roll.skill.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...RollOptions.SKILL_CHOICE_OPTION,
						required: true,
					},
					{
						...RollOptions.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_SECRET_OPTION,
						required: false,
					},
				],
			},
		],
 *
 * Command Options:
 *import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class RollOptions {
	public static readonly ROLL_EXPRESSION_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollExpression.name(),
		description: L.en.commandOptions.rollExpression.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ROLL_OVERWRITE_ATTACK_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollOverwriteAttack.name(),
		description: L.en.commandOptions.rollOverwriteAttack.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ROLL_OVERWRITE_SAVE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollOverwriteSave.name(),
		description: L.en.commandOptions.rollOverwriteSave.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ROLL_OVERWRITE_DAMAGE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollOverwriteDamage.name(),
		description: L.en.commandOptions.rollOverwriteDamage.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ROLL_SECRET_OPTION: APIApplicationCommandBasicOption = {
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
			{
				name: L.en.commandOptions.rollSecret.choices.secretAndNotify.name(),
				value: L.en.commandOptions.rollSecret.choices.secretAndNotify.value(),
			},
			{
				name: L.en.commandOptions.rollSecret.choices.sendToGm.name(),
				value: L.en.commandOptions.rollSecret.choices.sendToGm.value(),
			},
		],
	};
	public static readonly SKILL_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.skillChoice.name(),
		description: L.en.commandOptions.skillChoice.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly SAVE_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.saveChoice.name(),
		description: L.en.commandOptions.saveChoice.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ATTACK_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.attackChoice.name(),
		description: L.en.commandOptions.attackChoice.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ROLL_MODIFIER_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollModifier.name(),
		description: L.en.commandOptions.rollModifier.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ATTACK_ROLL_MODIFIER_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.attackRollModifier.name(),
		description: L.en.commandOptions.attackRollModifier.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly DAMAGE_ROLL_MODIFIER_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.damageRollModifier.name(),
		description: L.en.commandOptions.damageRollModifier.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly HEIGHTEN_LEVEL_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollHeightenLevel.name(),
		description: L.en.commandOptions.rollHeightenLevel.description(),
		required: false,
		type: ApplicationCommandOptionType.Integer,
	};
	public static readonly ROLL_TARGET_DC_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollTargetDc.name(),
		description: L.en.commandOptions.rollTargetDc.description(),
		required: false,
		type: ApplicationCommandOptionType.Integer,
	};
	public static readonly ROLL_TARGET_AC_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollTargetAC.name(),
		description: L.en.commandOptions.rollTargetAC.description(),
		required: false,
		type: ApplicationCommandOptionType.Integer,
	};
	public static readonly ROLL_SAVE_DICE_ROLL_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollSaveDiceRoll.name(),
		description: L.en.commandOptions.rollSaveDiceRoll.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ROLL_NOTE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollNote.name(),
		description: L.en.commandOptions.rollNote.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}

 *
 * L.en.commandOptions
 *
	saveChoice: {
		name: 'save',
		description: 'The save to roll.',
	},
	skillChoice: {
		name: 'skill',
		description: 'The skill to roll.',
		overwrites: {
			initJoinDescription: 'The skill to use for initiative instead of perception.',
		},
	},
	attackChoice: {
		name: 'attack',
		description: 'The attack to roll.',
	},
	rollOverwriteAttack: {
		name: 'overwrite-attack-roll',
		description: 'An alternate attack roll replacing all attack rolls',
	},
	rollOverwriteSave: {
		name: 'overwrite-save-roll',
		description: 'An alternate save roll replacing all save rolls',
	},
	rollOverwriteDamage: {
		name: 'overwrite-damage-roll',
		description: 'An alternate damage roll replacing the FIRST damage roll.',
	},
	rollExpression: {
		name: 'dice',
		description: 'The dice expression to roll. Similar to Roll20 dice rolls.',
		overwrites: {
			initAddDescription: 'Dice to roll to join initiative.',
			initJoinDescription:
				'Dice to roll to join initiative. ' + 'Modifies your skill if you chose a skill.',
		},
	},
	rollSecret: {
		name: 'secret',
		description: 'Whether to send the roll in a hidden, temporary message.',
		choices: {
			public: {
				name: 'public',
				value: 'public',
				description: 'A public roll.',
			},
			secret: {
				name: 'secret',
				value: 'secret',
				description: 'A temporary, hidden roll viewable only to you.',
			},
			secretAndNotify: {
				name: 'secret-and-notify',
				value: 'secret-and-notify',
				description: 'A secret roll that still notifies the channel that a roll was made.',
			},
			sendToGm: {
				name: 'send-to-gm',
				value: 'send-to-gm',
				description: 'Only works if in a "game" in this server. Sends the roll to the GM.',
			},
		},
	},
	statBlockSecret: {
		name: 'secret',
		description: 'Whether to send the stat block in a hidden, temporary message.',
		choices: {
			public: {
				name: 'public',
				value: 'public',
				description: 'A public stat block.',
			},
			secret: {
				name: 'secret',
				value: 'secret',
				description: 'A temporary, hidden stat block message viewable only to you.',
			},
		},
	},
	rollModifier: {
		name: 'modifier',
		description: 'A dice expression to modify your roll. (e.g. "+ 1 + 1d4")',
	},
	rollTargetDc: {
		name: 'overwrite-dc',
		description: 'Provide a custom DC to roll attacks against.',
	},
	rollTargetAC: {
		name: 'overwrite-ac',
		description: 'Provide a custom AC to roll the attack against.',
	},
	rollSaveDiceRoll: {
		name: 'overwrite-save-dice-roll',
		description: 'Provide the dice roll to use for any saving throw in the action.',
	},
	attackRollModifier: {
		name: 'attack_modifier',
		description: 'A dice expression to modify your attack roll. (e.g. "+ 1 + 1d4")',
	},
	damageRollModifier: {
		name: 'damage_modifier',
		description: 'A dice expression to modify your damage roll. (e.g. "+ 1 + 1d4")',
	},
	otherRollModifier: {
		name: 'other_modifier',
		description: 'A dice expression to modify your "other" action rolls. (e.g. "+ 1 + 1d4")',
	},
	rollHeightenLevel: {
		name: 'heighten',
		description: 'The level to heighten the action to.',
	},
	rollNote: {
		name: 'note',
		description: 'A note about the reason for the roll.',
	},
 *
 * L.en.commands
 *export default {
	name: 'roll',
	description: 'Roll Dice',
	interactions: {
		noActiveCharacter: "Yip! You don't have any active characters!",
		secretRollNotification: "Yip! I'm rolling in secret!",
		rolledDice: 'rolled {diceType}',
		damageTaken: '{creatureName} took {damage} damage!',
		targetNotFound: 'Yip! I couldn\'t find a target named "{targetName}"',
	},

	dice: {
		name: 'dice',
		options: '[dice] [*note*] [*secret*]',
		usage:
			'**[dice]**: The dice expression to roll ("1d20 - 1d4 + 3). Uses a ' +
			'similar syntax to Roll20.\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, or ' +
			'hide the roll, but publicly notify the channel that a roll has been made.',
		description: `Rolls some dice.`,
		interactions: {
			rolledDice: 'rolled some dice!',
		},
	},
	skill: {
		name: 'skill',
		options: '[skill] [*dice*] [*note*] [*secret*]',
		usage:
			'**[skill]**: The name of the skill to roll.\n' +
			'**[*dice*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to the end ' +
			'of the skill roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, ' +
			'hide the roll, but publicly notify the channel that a roll has been made, or send the roll to your gm.',
		description: `rolls a skill for your active character`,
	},
	perception: {
		name: 'perception',
		options: '[*dice*] [*note*] [*secret*]',
		usage:
			'**[*dice*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to the end ' +
			'of the perception roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, ' +
			'hide the roll, but publicly notify the channel that a roll has been made, or send the roll to your gm.',
		description: `rolls perception for your active character`,
	},
	save: {
		name: 'save',
		options: '[save] [*dice*] [*note*] [*secret*]',
		usage:
			'**[save]**: The name of the saving throw to roll.\n' +
			'**[*dice*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to the end ' +
			'of the save roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, ' +
			'hide the roll, but publicly notify the channel that a roll has been made, or send the roll to your gm.',
		description: `rolls a saving throw for your active character`,
	},
	ability: {
		name: 'ability',
		options: '[ability] [*dice*] [*note*] [*secret*]',
		usage:
			'**[ability]**: The name of the ability to roll.\n' +
			'**[*dice*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to the end ' +
			'of the ability roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, ' +
			'hide the roll, but publicly notify the channel that a roll has been made, or send the roll to your gm.',
		description: `rolls an ability for your active character`,
	},
	attack: {
		name: 'attack',
		options:
			'[attack] [target-character] [*attack_modifier*] [*damage_modifier*] [*note*] [*secret*] [*overwrite-ac*]',
		usage:
			'**[attack]**: The name of the attack to roll.\n' +
			'**[target-character]**: The target character. Select (None) for no target.\n' +
			'**[*attack\\_modifier*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to ' +
			'the end of the attack roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*damage\\_modifier*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to ' +
			'the end of the damage roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, ' +
			'hide the roll, but publicly notify the channel that a roll has been made, or send the roll to your gm.\n' +
			'**[*overwrite-ac*] optional**: Overwrite the AC of the attack.',
		description: `rolls an attack for your active character`,
		interactions: {
			rollEmbed: {
				rollDescription: 'attacked with their {attackName}!',
				toHit: 'To Hit',
				damage: 'Damage',
			},
		},
	},
	action: {
		name: 'action',
		options:
			'[action] [target-character] [*action_modifier*] [*damage_modifier*] [*note*] [*secret*] [*overwrite-dc*] [*overwrite-save-dice-roll*]',
		usage:
			'**[action]**: The name of the action to roll.\n' +
			'**[target-character]**: The target character. Select (None) for no target.\n' +
			'**[*attack\\_modifier*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to ' +
			'the end of the attack roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*damage\\_modifier*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to ' +
			'the end of the damage roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, ' +
			'hide the roll, but publicly notify the channel that a roll has been made, or send the roll to your gm.' +
			'**[*overwrite-dc*] optional**: Overwrite the DC of the action. Only works if the action has a DC.\n' +
			'**[*overwrite-save-dice-roll*] optional**: Overwrite the dice roll of the save. Only works if the action has a save.',
		description: `rolls an action for your active character`,
		interactions: {
			rollEmbed: {
				rollDescription: 'used {actionName}!',
			},
		},
	},
};

 *
 */
