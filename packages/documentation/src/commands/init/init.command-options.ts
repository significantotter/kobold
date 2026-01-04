import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.types.js';

export enum InitCommandOptionEnum {
	initValue = 'value',
	initNote = 'note',
	template = 'template',
	initActor = 'name',
	initCharacter = 'character',
	initCharacterTarget = 'target-character',
	initCreature = 'creature',
	initHideStats = 'hide-stats',
	initCustomStats = 'custom-stats',
	initTargetActor = 'target-initiative-member',
	initRollChoice = 'roll',
	initSetOption = 'option',
	initSetValue = 'set-value',
	skillChoice = 'skill',
	rollExpression = 'dice',
	rollModifier = 'modifier',
	damageRollModifier = 'damage-modifier',
	rollSecret = 'secret',
	rollTargetAc = 'overwrite-ac',
	rollOverwriteAttack = 'overwrite-attack',
	rollOverwriteSave = 'overwrite-save',
	rollOverwriteDamage = 'overwrite-damage',
}

/**
 * Choice values for options with predefined choices.
 * This is the source of truth - command options derive choices from here.
 * Access via InitCommand.optionChoices.rollSecret.public etc.
 */
export const initOptionChoices = {
	/** Choices for the rollSecret option */
	rollSecret: {
		public: 'public',
		secret: 'secret',
		secretAndNotify: 'secret-and-notify',
		sendToGm: 'send-to-gm',
	},
	/** Choices for the template option */
	template: {
		normal: 'normal',
		elite: 'elite',
		weak: 'weak',
	},
	/** Choices for the initSetOption option */
	setOption: {
		initiative: 'initiative',
		name: 'name',
		playerIsGm: 'player-is-gm',
		hideStats: 'hide-stats',
	},
} as const;

export const initCommandOptions = {
	[InitCommandOptionEnum.initValue]: {
		name: 'value',
		description: 'A value to set your initiative to. Overwrites any other init options.',
		required: false,
		type: ApplicationCommandOptionType.Number,
	},
	[InitCommandOptionEnum.initNote]: {
		name: 'note',
		description: 'A note displayed in the initiative tracker or about the roll.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.template]: {
		name: 'template',
		description: 'Optionally apply a template to the added creature.',
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: Object.values(initOptionChoices.template).map(value => ({
			name: value,
			value: value,
		})),
	},
	[InitCommandOptionEnum.initActor]: {
		name: 'name',
		description: 'What to display the NPC/minion as in the initiative order.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.initCharacter]: {
		name: 'character',
		description: 'A character or npc present in the initiative.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.initCharacterTarget]: {
		name: 'target-character',
		description: 'The character being targeted.',
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.initCreature]: {
		name: 'creature',
		description: 'A creature to add to the initiative.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.initHideStats]: {
		name: 'hide-stats',
		description: 'Whether to hide the stats of the character/creature in the initiative.',
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	},
	[InitCommandOptionEnum.initCustomStats]: {
		name: 'custom-stats',
		description: 'Overrides for the custom stats. In the format "hp=35;ac=20;will=7"',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.initTargetActor]: {
		name: 'target-initiative-member',
		description: 'Which member of the initiative to target.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.initRollChoice]: {
		name: 'roll',
		description:
			'What to have that initiative member roll. Choose the initiative member first!',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.initSetOption]: {
		name: 'option',
		description: 'The character option to alter (only within this initiative).',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: Object.values(initOptionChoices.setOption).map(value => ({
			name: value,
			value: value,
		})),
	},
	[InitCommandOptionEnum.initSetValue]: {
		name: 'value',
		description: 'The value to set the option to.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.skillChoice]: {
		name: 'skill',
		description: 'The skill to roll.',
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.rollExpression]: {
		name: 'dice',
		description: 'The dice expression to roll. Similar to Roll20 dice rolls.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.rollModifier]: {
		name: 'modifier',
		description: 'A dice expression to modify your roll. (e.g. "+ 1 + 1d4")',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.damageRollModifier]: {
		name: 'damage-modifier',
		description: 'A dice expression to modify your damage roll. (e.g. "+ 1 + 1d4")',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.rollSecret]: {
		name: 'secret',
		description: 'Whether to send the roll in a hidden, temporary message.',
		type: ApplicationCommandOptionType.String,
		choices: Object.values(initOptionChoices.rollSecret).map(value => ({
			name: value,
			value: value,
		})),
	},
	[InitCommandOptionEnum.rollTargetAc]: {
		name: 'overwrite-ac',
		description: 'Provide a custom AC to roll the attack against.',
		required: false,
		type: ApplicationCommandOptionType.Integer,
	},
	[InitCommandOptionEnum.rollOverwriteAttack]: {
		name: 'overwrite-attack-roll',
		description: 'An alternate attack roll replacing all attack rolls',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.rollOverwriteSave]: {
		name: 'overwrite-save-roll',
		description: 'An alternate save roll replacing all save rolls',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.rollOverwriteDamage]: {
		name: 'overwrite-damage-roll',
		description: 'An alternate damage roll replacing the FIRST damage roll.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<InitCommandOptionEnum>;
