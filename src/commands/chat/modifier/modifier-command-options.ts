import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class ModifierOptions {
	public static readonly MODIFIER_CUSTOM_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.modifierCustomOption.name(),
		description: Language.LL.commandOptions.modifierCustomOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.modifierCustomOption.choices.both.name(),
				value: Language.LL.commandOptions.modifierCustomOption.choices.both.value(),
			},
			{
				name: Language.LL.commandOptions.modifierCustomOption.choices.custom.name(),
				value: Language.LL.commandOptions.modifierCustomOption.choices.custom.value(),
			},
			{
				name: Language.LL.commandOptions.modifierCustomOption.choices.default.name(),
				value: Language.LL.commandOptions.modifierCustomOption.choices.default.value(),
			},
		],
	};
	public static readonly MODIFIER_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.modifierName.name(),
		description: Language.LL.commandOptions.modifierName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_TYPE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.modifierType.name(),
		description: Language.LL.commandOptions.modifierType.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MODIFIER_DESCRIPTION_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.modifierDescription.name(),
		description: Language.LL.commandOptions.modifierDescription.description(),
		required: false,
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

	public static readonly MODIFIER_SET_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.modifierSetOption.name(),
		description: Language.LL.commandOptions.modifierSetOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.modifierSetOption.choices.name.name(),
				value: Language.LL.commandOptions.modifierSetOption.choices.name.value(),
			},
			{
				name: Language.LL.commandOptions.modifierSetOption.choices.description.name(),
				value: Language.LL.commandOptions.modifierSetOption.choices.description.value(),
			},
			{
				name: Language.LL.commandOptions.modifierSetOption.choices.type.name(),
				value: Language.LL.commandOptions.modifierSetOption.choices.type.value(),
			},
			{
				name: Language.LL.commandOptions.modifierSetOption.choices.value.name(),
				value: Language.LL.commandOptions.modifierSetOption.choices.value.value(),
			},
			{
				name: Language.LL.commandOptions.modifierSetOption.choices.targetTags.name(),
				value: Language.LL.commandOptions.modifierSetOption.choices.targetTags.value(),
			},
		],
	};
	public static readonly MODIFIER_SET_VALUE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.modifierSetValue.name(),
		description: Language.LL.commandOptions.modifierSetValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
