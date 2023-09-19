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
	public static readonly MODIFIER_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierName.name(),
		description: L.en.commandOptions.modifierName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_TYPE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierType.name(),
		description: L.en.commandOptions.modifierType.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_DESCRIPTION_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierDescription.name(),
		description: L.en.commandOptions.modifierDescription.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_VALUE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierValue.name(),
		description: L.en.commandOptions.modifierValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_TARGET_TAGS_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierTargetTags.name(),
		description: L.en.commandOptions.modifierTargetTags.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_SHEET_VALUES_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierSheetValues.name(),
		description: L.en.commandOptions.modifierSheetValues.description(),
		required: true,
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
				name: L.en.commandOptions.modifierSetOption.choices.value.name(),
				value: L.en.commandOptions.modifierSetOption.choices.value.value(),
			},
			{
				name: L.en.commandOptions.modifierSetOption.choices.targetTags.name(),
				value: L.en.commandOptions.modifierSetOption.choices.targetTags.value(),
			},
			{
				name: L.en.commandOptions.modifierSetOption.choices.sheetValues.name(),
				value: L.en.commandOptions.modifierSetOption.choices.sheetValues.value(),
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
