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
	public static readonly MODIFIER_SEVERITY_VALUE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierSeverity.name(),
		description: L.en.commandOptions.modifierSeverity.description(),
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
		name: L.en.commandOptions.modifierUpdateOption.name(),
		description: L.en.commandOptions.modifierUpdateOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.modifierUpdateOption.choices.name.name(),
				value: L.en.commandOptions.modifierUpdateOption.choices.name.value(),
			},
			{
				name: L.en.commandOptions.modifierUpdateOption.choices.description.name(),
				value: L.en.commandOptions.modifierUpdateOption.choices.description.value(),
			},
			{
				name: L.en.commandOptions.modifierUpdateOption.choices.type.name(),
				value: L.en.commandOptions.modifierUpdateOption.choices.type.value(),
			},
			{
				name: L.en.commandOptions.modifierUpdateOption.choices.rollAdjustment.name(),
				value: L.en.commandOptions.modifierUpdateOption.choices.rollAdjustment.value(),
			},
			{
				name: L.en.commandOptions.modifierUpdateOption.choices.rollTargetTags.name(),
				value: L.en.commandOptions.modifierUpdateOption.choices.rollTargetTags.value(),
			},
			{
				name: L.en.commandOptions.modifierUpdateOption.choices.sheetValues.name(),
				value: L.en.commandOptions.modifierUpdateOption.choices.sheetValues.value(),
			},
		],
	};
	public static readonly MODIFIER_SET_VALUE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierUpdateValue.name(),
		description: L.en.commandOptions.modifierUpdateValue.description(),
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
