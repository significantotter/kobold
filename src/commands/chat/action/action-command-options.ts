import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class ActionOptions {
	public static readonly ACTION_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionName.name(),
		description: Language.LL.commandOptions.actionName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_DESCRIPTION_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionDescription.name(),
		description: Language.LL.commandOptions.actionDescription.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_TARGET_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionTarget.name(),
		description: Language.LL.commandOptions.actionTarget.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_TARGET_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionRollTarget.name(),
		description: Language.LL.commandOptions.actionRollTarget.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionRollName.name(),
		description: Language.LL.commandOptions.actionRollName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_DICE_ROLL_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionDiceRoll.name(),
		description: Language.LL.commandOptions.actionDiceRoll.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_TAGS_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionRollTags.name(),
		description: Language.LL.commandOptions.actionRollTags.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_IMPORT_URL_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionImportUrl.name(),
		description: Language.LL.commandOptions.actionImportUrl.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_IMPORT_MODE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionImportMode.name(),
		description: Language.LL.commandOptions.actionImportMode.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.actionImportMode.choices.overwrite.name(),
				value: Language.LL.commandOptions.actionImportMode.choices.overwrite.value(),
			},
			{
				name: Language.LL.commandOptions.actionImportMode.choices.fullyReplace.name(),
				value: Language.LL.commandOptions.actionImportMode.choices.fullyReplace.value(),
			},
			{
				name: Language.LL.commandOptions.actionImportMode.choices.renameOnConflict.name(),
				value: Language.LL.commandOptions.actionImportMode.choices.renameOnConflict.value(),
			},
			{
				name: Language.LL.commandOptions.actionImportMode.choices.ignoreOnConflict.name(),
				value: Language.LL.commandOptions.actionImportMode.choices.ignoreOnConflict.value(),
			},
		],
	};
}
