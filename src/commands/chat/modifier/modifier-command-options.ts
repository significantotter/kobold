import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class ModifierOptions {
	public static readonly MODIFIER_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.modifierName.name(),
		description: Language.LL.commandOptions.modifierName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_DESCRIPTION_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.modifierDescription.name(),
		description: Language.LL.commandOptions.modifierDescription.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_VALUE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.modifierValue.name(),
		description: Language.LL.commandOptions.modifierValue.description(),
		required: true,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly MODIFIER_TARGET_TAGS_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.modifierTargetTags.name(),
		description: Language.LL.commandOptions.modifierTargetTags.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
