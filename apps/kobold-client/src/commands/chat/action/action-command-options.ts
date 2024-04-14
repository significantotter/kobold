import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class ActionOptions {
	public static readonly ACTION_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionName.name(),
		description: L.en.commandOptions.actionName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_DESCRIPTION_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionDescription.name(),
		description: L.en.commandOptions.actionDescription.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_TYPE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionType.name(),
		description: L.en.commandOptions.actionType.description(),
		required: true,
		choices: [
			{
				name: L.en.commandOptions.actionType.choices.attack.name(),
				value: L.en.commandOptions.actionType.choices.attack.value(),
			},
			{
				name: L.en.commandOptions.actionType.choices.spell.name(),
				value: L.en.commandOptions.actionType.choices.spell.value(),
			},
			{
				name: L.en.commandOptions.actionType.choices.other.name(),
				value: L.en.commandOptions.actionType.choices.other.value(),
			},
		],
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ACTIONS_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionActions.name(),
		description: L.en.commandOptions.actionActions.description(),
		required: true,
		choices: [
			{
				name: L.en.commandOptions.actionActions.choices.reaction.name(),
				value: L.en.commandOptions.actionActions.choices.reaction.value(),
			},
			{
				name: L.en.commandOptions.actionActions.choices.free.name(),
				value: L.en.commandOptions.actionActions.choices.free.value(),
			},
			{
				name: L.en.commandOptions.actionActions.choices.one.name(),
				value: L.en.commandOptions.actionActions.choices.one.value(),
			},
			{
				name: L.en.commandOptions.actionActions.choices.two.name(),
				value: L.en.commandOptions.actionActions.choices.two.value(),
			},
			{
				name: L.en.commandOptions.actionActions.choices.three.name(),
				value: L.en.commandOptions.actionActions.choices.three.value(),
			},
			{
				name: L.en.commandOptions.actionActions.choices.variable.name(),
				value: L.en.commandOptions.actionActions.choices.variable.value(),
			},
		],
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_BASE_LEVEL_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionBaseLevel.name(),
		description: L.en.commandOptions.actionBaseLevel.description(),
		required: false,
		type: ApplicationCommandOptionType.Integer,
	};
	public static readonly ACTION_AUTO_HEIGHTEN_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionAutoHeighten.name(),
		description: L.en.commandOptions.actionAutoHeighten.description(),
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly ACTION_TARGET_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionTarget.name(),
		description: L.en.commandOptions.actionTarget.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_EDIT_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionSetOption.name(),
		description: L.en.commandOptions.actionSetOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.actionSetOption.choices.name.name(),
				value: L.en.commandOptions.actionSetOption.choices.name.value(),
			},
			{
				name: L.en.commandOptions.actionSetOption.choices.description.name(),
				value: L.en.commandOptions.actionSetOption.choices.description.value(),
			},
			{
				name: L.en.commandOptions.actionSetOption.choices.type.name(),
				value: L.en.commandOptions.actionSetOption.choices.type.value(),
			},
			{
				name: L.en.commandOptions.actionSetOption.choices.actionCost.name(),
				value: L.en.commandOptions.actionSetOption.choices.actionCost.value(),
			},
			{
				name: L.en.commandOptions.actionSetOption.choices.baseLevel.name(),
				value: L.en.commandOptions.actionSetOption.choices.baseLevel.value(),
			},
			{
				name: L.en.commandOptions.actionSetOption.choices.tags.name(),
				value: L.en.commandOptions.actionSetOption.choices.tags.value(),
			},
			{
				name: L.en.commandOptions.actionSetOption.choices.autoHeighten.name(),
				value: L.en.commandOptions.actionSetOption.choices.autoHeighten.value(),
			},
		],
	};
	public static readonly ACTION_EDIT_VALUE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionSetValue.name(),
		description: L.en.commandOptions.actionSetValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_TAGS_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionTags.name(),
		description: L.en.commandOptions.actionTags.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_IMPORT_URL_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionImportUrl.name(),
		description: L.en.commandOptions.actionImportUrl.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_IMPORT_MODE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionImportMode.name(),
		description: L.en.commandOptions.actionImportMode.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.actionImportMode.choices.overwrite.name(),
				value: L.en.commandOptions.actionImportMode.choices.overwrite.value(),
			},
			{
				name: L.en.commandOptions.actionImportMode.choices.fullyReplace.name(),
				value: L.en.commandOptions.actionImportMode.choices.fullyReplace.value(),
			},
			{
				name: L.en.commandOptions.actionImportMode.choices.renameOnConflict.name(),
				value: L.en.commandOptions.actionImportMode.choices.renameOnConflict.value(),
			},
			{
				name: L.en.commandOptions.actionImportMode.choices.ignoreOnConflict.name(),
				value: L.en.commandOptions.actionImportMode.choices.ignoreOnConflict.value(),
			},
		],
	};
}
