import { CommandDocumentation } from '../helpers/commands.d.js';
import {
	modifierCommandDefinition,
	ModifierSubCommandEnum,
} from './modifier.command-definition.js';

export const modifierCommandDocumentation: CommandDocumentation<typeof modifierCommandDefinition> =
	{
		name: 'modifier',
		description: '',
		subCommands: {
			[ModifierSubCommandEnum.list]: {
				name: ModifierSubCommandEnum.list,
				description: 'Lists all modifiers available to your active character.',
				usage: null,
				examples: [],
			},
			[ModifierSubCommandEnum.detail]: {
				name: ModifierSubCommandEnum.detail,
				description: 'Describes a modifier available to your active character.',
				usage: null,
				examples: [],
			},
			[ModifierSubCommandEnum.severity]: {
				name: ModifierSubCommandEnum.severity,
				description: 'Set the severity of a modifier.',
				usage: null,
				examples: [],
			},
			[ModifierSubCommandEnum.toggle]: {
				name: ModifierSubCommandEnum.toggle,
				description:
					'Toggles whether a modifier is currently applying to your active character.',
				usage: null,
				examples: [],
			},
			[ModifierSubCommandEnum.set]: {
				name: ModifierSubCommandEnum.set,
				description: 'Sets a field for a modifier for your active character.',
				usage: null,
				examples: [],
			},
			[ModifierSubCommandEnum.createModifier]: {
				name: ModifierSubCommandEnum.createModifier,
				description: 'Creates a modifier for the active character.',
				usage: null,
				examples: [],
			},
			[ModifierSubCommandEnum.remove]: {
				name: ModifierSubCommandEnum.remove,
				description: 'Removes a modifier for the active character.',
				usage: null,
				examples: [],
			},
			[ModifierSubCommandEnum.export]: {
				name: ModifierSubCommandEnum.export,
				description:
					'Exports a chunk of modifier data for you to later import on another character.',
				usage: null,
				examples: [],
			},
			[ModifierSubCommandEnum.import]: {
				name: ModifierSubCommandEnum.import,
				description: 'Imports a list of modifier data to a character from PasteBin.',
				usage: null,
				examples: [],
			},
		},
	};

/**
 *
 * Command definition:
 * 
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.modifier.name(),
		description: L.en.commands.modifier.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.modifier.list.name(),
				description: L.en.commands.modifier.list.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: L.en.commands.modifier.detail.name(),
				description: L.en.commands.modifier.detail.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ModifierOptions.MODIFIER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
			{
				name: L.en.commands.modifier.export.name(),
				description: L.en.commands.modifier.export.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [],
			},
			{
				name: L.en.commands.modifier.import.name(),
				description: L.en.commands.modifier.import.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ModifierOptions.MODIFIER_IMPORT_URL,
					ModifierOptions.MODIFIER_IMPORT_MODE,
				],
			},
			{
				name: L.en.commands.modifier.createModifier.name(),
				description: L.en.commands.modifier.createModifier.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ModifierOptions.MODIFIER_NAME_OPTION,
					ModifierOptions.MODIFIER_SHEET_VALUES_OPTION,
					ModifierOptions.MODIFIER_ROLL_ADJUSTMENT,
					ModifierOptions.MODIFIER_ROLL_TARGET_TAGS_OPTION,
					ModifierOptions.MODIFIER_TYPE_OPTION,
					ModifierOptions.MODIFIER_SEVERITY_VALUE_OPTION,
					ModifierOptions.MODIFIER_DESCRIPTION_OPTION,
					ModifierOptions.MODIFIER_INITIATIVE_NOTE_OPTION,
				],
			},
			{
				name: L.en.commands.modifier.toggle.name(),
				description: L.en.commands.modifier.toggle.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ModifierOptions.MODIFIER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
			{
				name: L.en.commands.modifier.severity.name(),
				description: L.en.commands.modifier.severity.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ModifierOptions.MODIFIER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
					{
						...ModifierOptions.MODIFIER_SEVERITY_VALUE_OPTION,
						required: true,
					},
				],
			},
			{
				name: L.en.commands.modifier.set.name(),
				description: L.en.commands.modifier.set.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ModifierOptions.MODIFIER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
					ModifierOptions.MODIFIER_SET_OPTION,
					ModifierOptions.MODIFIER_SET_VALUE_OPTION,
				],
			},
			{
				name: L.en.commands.modifier.remove.name(),
				description: L.en.commands.modifier.remove.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ModifierOptions.MODIFIER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
		],
 * Command Options:
		import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class ModifierOptions {
	public static readonly MODIFIER_CUSTOM_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierCustomOption.name(),
		description: L.en.commandOptions.modifierCustomOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.modifierCustomOption.choices.both.name(),
				value: L.en.commandOptions.modifierCustomOption.choices.both.value(),
			},
			{
				name: L.en.commandOptions.modifierCustomOption.choices.custom.name(),
				value: L.en.commandOptions.modifierCustomOption.choices.custom.value(),
			},
			{
				name: L.en.commandOptions.modifierCustomOption.choices.default.name(),
				value: L.en.commandOptions.modifierCustomOption.choices.default.value(),
			},
		],
	};
	public static readonly MODIFIER_SEVERITY_VALUE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierSeverity.name(),
		description: L.en.commandOptions.modifierSeverity.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_INITIATIVE_NOTE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierInitiativeNote.name(),
		description: L.en.commandOptions.modifierInitiativeNote.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierName.name(),
		description: L.en.commandOptions.modifierName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_TYPE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierType.name(),
		description: L.en.commandOptions.modifierType.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.modifierType.choices.untyped.name(),
				value: L.en.commandOptions.modifierType.choices.untyped.value(),
			},
			{
				name: L.en.commandOptions.modifierType.choices.status.name(),
				value: L.en.commandOptions.modifierType.choices.status.value(),
			},
			{
				name: L.en.commandOptions.modifierType.choices.circumstance.name(),
				value: L.en.commandOptions.modifierType.choices.circumstance.value(),
			},
			{
				name: L.en.commandOptions.modifierType.choices.item.name(),
				value: L.en.commandOptions.modifierType.choices.item.value(),
			},
		],
	};
	public static readonly MODIFIER_DESCRIPTION_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierDescription.name(),
		description: L.en.commandOptions.modifierDescription.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_ROLL_ADJUSTMENT: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierRollAdjustment.name(),
		description: L.en.commandOptions.modifierRollAdjustment.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_ROLL_TARGET_TAGS_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierTargetTags.name(),
		description: L.en.commandOptions.modifierTargetTags.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_SHEET_VALUES_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierSheetValues.name(),
		description: L.en.commandOptions.modifierSheetValues.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};

	public static readonly MODIFIER_SET_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierSetOption.name(),
		description: L.en.commandOptions.modifierSetOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.modifierSetOption.choices.name.name(),
				value: L.en.commandOptions.modifierSetOption.choices.name.value(),
			},
			{
				name: L.en.commandOptions.modifierSetOption.choices.description.name(),
				value: L.en.commandOptions.modifierSetOption.choices.description.value(),
			},
			{
				name: L.en.commandOptions.modifierSetOption.choices.type.name(),
				value: L.en.commandOptions.modifierSetOption.choices.type.value(),
			},
			{
				name: L.en.commandOptions.modifierSetOption.choices.rollAdjustment.name(),
				value: L.en.commandOptions.modifierSetOption.choices.rollAdjustment.value(),
			},
			{
				name: L.en.commandOptions.modifierSetOption.choices.rollTargetTags.name(),
				value: L.en.commandOptions.modifierSetOption.choices.rollTargetTags.value(),
			},
			{
				name: L.en.commandOptions.modifierSetOption.choices.sheetValues.name(),
				value: L.en.commandOptions.modifierSetOption.choices.sheetValues.value(),
			},
			{
				name: L.en.commandOptions.modifierSetOption.choices.note.name(),
				value: L.en.commandOptions.modifierSetOption.choices.note.value(),
			},
		],
	};
	public static readonly MODIFIER_SET_VALUE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierSetValue.name(),
		description: L.en.commandOptions.modifierSetValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_IMPORT_MODE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierImportMode.name(),
		description: L.en.commandOptions.modifierImportMode.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.modifierImportMode.choices.overwrite.name(),
				value: L.en.commandOptions.modifierImportMode.choices.overwrite.value(),
			},
			{
				name: L.en.commandOptions.modifierImportMode.choices.fullyReplace.name(),
				value: L.en.commandOptions.modifierImportMode.choices.fullyReplace.value(),
			},
			{
				name: L.en.commandOptions.modifierImportMode.choices.renameOnConflict.name(),
				value: L.en.commandOptions.modifierImportMode.choices.renameOnConflict.value(),
			},
			{
				name: L.en.commandOptions.modifierImportMode.choices.ignoreOnConflict.name(),
				value: L.en.commandOptions.modifierImportMode.choices.ignoreOnConflict.value(),
			},
		],
	};
	public static readonly MODIFIER_IMPORT_URL: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierImportUrl.name(),
		description: L.en.commandOptions.modifierImportUrl.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
 * Modifier Command Option definition (L.en.commandOptions):


	modifierName: {
		name: 'name',
		description: 'The name of the modifier.',
	},
	conditionName: {
		name: 'name',
		description: 'The name of the condition.',
	},
	modifierType: {
		name: 'type',
		description: 'The optional type (status, item, or circumstance) of the modifier.',
		choices: {
			status: {
				name: 'status',
				value: 'status',
			},
			item: {
				name: 'item',
				value: 'item',
			},
			circumstance: {
				name: 'circumstance',
				value: 'circumstance',
			},
			untyped: {
				name: 'untyped',
				value: 'untyped',
			},
		},
	},
	modifierDescription: {
		name: 'description',
		description: 'A description for the modifier.',
	},
	modifierInitiativeNote: {
		name: 'initiative-note',
		description: 'A note to display in initiative when active.',
	},
	modifierRollAdjustment: {
		name: 'roll-adjustment',
		description: 'The amount to adjust a dice roll. Can be a number or a dice expression.',
	},
	modifierSeverity: {
		name: 'severity',
		description: 'A measure of a modifier\'s effect. Use "[severity]" in the value.',
	},
	modifierTargetTags: {
		name: 'roll-target-tags',
		description:
			'A set of tags for the rolls that this modifier applies to. For example "skill or attack or save"',
	},
	modifierSheetValues: {
		name: 'sheet-values',
		description: 'How to alter the sheet values. For example "maxHp+5;ac=20;will-1"',
	},
	modifierSetOption: {
		name: 'option',
		description: 'The modifier option to alter.',
		choices: {
			name: {
				name: 'name',
				value: 'name',
			},
			description: {
				name: 'description',
				value: 'description',
			},
			type: {
				name: 'type',
				value: 'type',
			},
			rollAdjustment: {
				name: 'roll-adjustment',
				value: 'roll-adjustment',
			},
			rollTargetTags: {
				name: 'roll-target-tags',
				value: 'roll-target-tags',
			},
			sheetValues: {
				name: 'sheet-values',
				value: 'sheet-values',
			},
			severity: {
				name: 'severity',
				value: 'severity',
			},
			note: {
				name: 'initiative-note',
				value: 'initiative-note',
			},
		},
	},
	modifierSetValue: {
		name: 'value',
		description: 'The value to set the option to.',
	},
	modifierCustomOption: {
		name: 'custom',
		description: 'Whether to view custom created modifiers, default modifiers, or both.',
		choices: {
			custom: {
				name: 'custom',
				value: 'custom',
			},
			default: {
				name: 'default',
				value: 'default',
			},
			both: {
				name: 'both',
				value: 'both',
			},
		},
	},
	modifierImportMode: {
		name: 'import-mode',
		description: 'What to do when importing data.',
		choices: {
			fullyReplace: {
				name: 'overwrite-all',
				value: 'overwrite-all',
			},
			overwrite: {
				name: 'overwrite-on-conflict',
				value: 'overwrite-on-conflict',
			},
			renameOnConflict: {
				name: 'rename-on-conflict',
				value: 'rename-on-conflict',
			},
			ignoreOnConflict: {
				name: 'ignore-on-conflict',
				value: 'ignore-on-conflict',
			},
		},
	},
	modifierImportUrl: {
		name: 'url',
		description: 'The pastebin url with the modifier code to import.',
	},

 * 
 * Modifier definitions (L.en.commands):
 * export default {
	name: 'modifier',
	description: 'Toggleable values to modify specified dice rolls.',

	interactions: {
		notFound: "Yip! I couldn't find a modifier with that name.",
		detailHeader: '{modifierName}{modifierIsActive}',
	},
	list: {
		name: 'list',
		description: 'Lists all modifiers available to your active character.',
	},
	detail: {
		name: 'detail',
		description: 'Describes a modifier available to your active character.',
	},
	severity: {
		name: 'severity',
		description: 'Set the severity of a modifier.',
	},
	toggle: {
		name: 'toggle',
		description: 'Toggles whether a modifier is currently applying to your active character.',
		interactions: {
			success:
				'Yip! {characterName} had their modifier {modifierName} set to {activeSetting}.',
			active: 'active',
			inactive: 'inactive',
		},
	},
	set: {
		name: 'set',
		description: 'Sets a field for a modifier for your active character.',
		interactions: {
			invalidOptionError: 'Yip! Please send a valid option to set.',
			emptyNameError: "Yip! You can't use an empty name!",
			nameExistsError: 'Yip! A modifier with that name already exists.',
			valueNotNumberError: 'Yip! You can only set that modifier value with a number.',
			successEmbed: {
				title: "Yip! {characterName} had their modifier {modifierName}'s {fieldToChange} set to {newFieldValue}.",
			},
		},
	},
	createModifier: {
		name: 'create-modifier',
		description: 'Creates a modifier for the active character.',
		usage:
			'[name]: The name of the sheet modifier.\n' +
			'[type]: The in-game type of the modifier. "untyped" will always stack.\n' +
			'[sheet-adjustment]: The properties to modify and their values. For example: ' +
			'"ac=20;dex checks-1;occultAttack+2;" This would overwrite your ac to 20, ' +
			'subtract 1 from of all your dexterity dice checks, and increase your occult spell attack by 2\n' +
			'[roll-adjustment]: The roll portion of the modifier. For example: "1d6" \n' +
			'[roll-target-tags]: The tags that the roll portion of the modifier applies to. For example: "attack or skill"',
		expandedDescription:
			"Sheet modifiers are conditional bonuses or penalties that apply to a character's sheet. " +
			'They can be used to modify any value on your character sheet. \n\n' +
			'Formatting sheet modifiers is simple. The format is: `property=value;property+value;property-value`. ' +
			'You provide properties, values, and either "+", "-", or "=" to modify the property. You can + or - or = any ' +
			'numeric property. But a property like "imageURL" can only be set with =, since it isn\'t a number. ' +
			'Use ";" to separate multiple properties\n\n' +
			'**Numeric Properties:** \n\n' +
			'General: age, fly speed, swim speed, climb speed, focus points, perception\n' +
			'Attributes: strength, dexterity, constitution, intelligence, wisdom, charisma, speed, ' +
			'Defenses: ac, max hp, max resolve, max stamina \n' +
			'Abilities/Spellcasting: class dc, class attack, arcane attack, arcane dc, divine attack, divine dc \n' +
			'occult attack, occult dc, primal attack, primal dc, ' +
			'Saves: fortitude, reflex, will, acrobatics \n' +
			'Skills: athletics, crafting, deception, diplomacy, intimidation, medicine, nature, occultism, ' +
			'performance, religion, society, stealth, survival, thievery\n\n' +
			'**Non-numeric Properties:** \n' +
			'name, description, gender, age, alignment, deity, imageURL, size \n\n\n' +
			'Roll modifiers are conditional bonuses or penalties that apply to certain dice rolls. ' +
			'Which dice rolls are affected is based on a system of "tags." For example, every attack roll has ' +
			'the `attack` tag and every skill roll has the `skill` tag. A full list of tags are available under ' +
			'`/help attributes-and-tags`. \n\nModifiers can be toggled active or inactive. When inactive, a ' +
			'modifier will never apply to a roll, even if it applies to the given tags.\n\n\n' +
			'**How to target rolls with target-tags**\n\n' +
			'\t**or**\n\n' +
			'`or` means you need EITHER tag in the roll.\n\n' +
			'`attack or save` means that the roll can either be an attack roll OR a save roll\n\n\n' +
			'\t**and**\n\n' +
			'`and` means you needs BOTH tags in the roll.\n\n' +
			"`attack and save` means the roll must be an attack roll AND a save roll, which doesn't happen!!\n\n" +
			'`skill and intimidation` would be true on any intimidation roll, because intimidation also has the skill tag!\n\n' +
			'\t**not**\n\n' +
			'`not` means that the roll applies to things that are not that tag \n\n' +
			'`skill and not strength` applies to skill rolls that are NOT strength skills\n\n\n' +
			'\t**Parentheses**\n\n' +
			'Parentheses group tags. () \n\n' +
			'`attack and (skill or dexterity)` requires attack and for the group to be valid! ' +
			'So BOTH attack and EITHER skill or dexterity must be in the roll\n\n\n' +
			'**Advanced**\n\n' +
			'To learn how to build target tags ' +
			'you can also reference [this link](https://github.com/joewalnes/filtrex), although its fairly technical.',
		interactions: {
			created: 'Yip! I created the modifier {modifierName} for {characterName}.',
			alreadyExists:
				'Yip! A modifier named {modifierName} already exists for {characterName}.',
			invalidTags:
				"Yip! I didn't understand the target tag expression you provided. Tags can be" +
				' any expression in a format like "attack or skill".',
			doesntEvaluateError: 'Yip! That modifier is not a valid number or dice roll.',
		},
	},
	remove: {
		name: 'remove',
		description: 'Removes a modifier for the active character.',

		interactions: {
			removeConfirmation: {
				text: `Are you sure you want to remove the modifier {modifierName}?`,
				removeButton: 'REMOVE',
				cancelButton: 'CANCEL',
				expired: 'Yip! Modifier removal request expired.',
			},
			cancel: 'Yip! Canceled the request to remove the modifier!',
			success: 'Yip! I removed the modifier {modifierName}.',
		},
	},
	export: {
		name: 'export',
		description:
			'Exports a chunk of modifier data for you to later import on another character.',
		interactions: {
			success:
				"Yip! I've saved {characterName}'s modifiers to [this PasteBin link]({pasteBinLink})",
		},
	},
	import: {
		name: 'import',
		description: 'Imports a list of modifier data to a character from PasteBin.',
		expandedDescription:
			'Imports a list of modifier data to a character from PasteBin. Use ' +
			'exported data from another character. Only try to modify it if you know how to work with JSON!',
		interactions: {
			failedParsing:
				"Yip! I can't figure out how to read that! Try exporting another modifier to check and make " +
				"sure you're formatting it right!",
			badUrl: "Yip! I don't understand that Url! Copy the pastebin url for the pasted modifiers directly into the Url field.",
			imported: 'Yip! I successfully imported those modifiers to {characterName}.',
		},
	},
};

 * 
 */
