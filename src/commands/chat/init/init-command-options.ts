import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class InitOptions {
	public static readonly INIT_VALUE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initValue.name(),
		description: Language.LL.commandOptions.initValue.description(),
		required: false,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly INIT_ADD_TEMPLATE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.template.name(),
		description: Language.LL.commandOptions.template.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.template.choices.normal.name(),
				value: Language.LL.commandOptions.template.choices.normal.value(),
			},
			{
				name: Language.LL.commandOptions.template.choices.elite.name(),
				value: Language.LL.commandOptions.template.choices.elite.value(),
			},
			{
				name: Language.LL.commandOptions.template.choices.weak.name(),
				value: Language.LL.commandOptions.template.choices.weak.value(),
			},
		],
	};
	public static readonly INIT_HIDE_STATS_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initHideStats.name(),
		description: Language.LL.commandOptions.initHideStats.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly INIT_CUSTOM_STATS_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initCustomStats.name(),
		description: Language.LL.commandOptions.initCustomStats.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_CHARACTER_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initCharacter.name(),
		description: Language.LL.commandOptions.initCharacter.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_CHARACTER_TARGET: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initCharacterTarget.name(),
		description: Language.LL.commandOptions.initCharacterTarget.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_STAT_BLOCK_SECRET_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.rollSecret.name(),
		description: Language.LL.commandOptions.rollSecret.description(),
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.rollSecret.choices.public.name(),
				value: Language.LL.commandOptions.rollSecret.choices.public.value(),
			},
			{
				name: Language.LL.commandOptions.rollSecret.choices.secret.name(),
				value: Language.LL.commandOptions.rollSecret.choices.secret.value(),
			},
		],
	};
	public static readonly INIT_TARGET_ACTOR_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initTargetActor.name(),
		description: Language.LL.commandOptions.initTargetActor.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_ROLL_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initRollChoice.name(),
		description: Language.LL.commandOptions.initRollChoice.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_CREATURE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initCreature.name(),
		description: Language.LL.commandOptions.initCreature.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTOR_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initActor.name(),
		description: Language.LL.commandOptions.initActor.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTOR_SET_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initSetOption.name(),
		description: Language.LL.commandOptions.initSetOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.initSetOption.choices.initiative.name(),
				value: Language.LL.commandOptions.initSetOption.choices.initiative.value(),
			},
			{
				name: Language.LL.commandOptions.initSetOption.choices.actorName.name(),
				value: Language.LL.commandOptions.initSetOption.choices.actorName.value(),
			},
			{
				name: Language.LL.commandOptions.initSetOption.choices.isGm.name(),
				value: Language.LL.commandOptions.initSetOption.choices.isGm.value(),
			},
			{
				name: Language.LL.commandOptions.initSetOption.choices.hideStats.name(),
				value: Language.LL.commandOptions.initSetOption.choices.hideStats.value(),
			},
		],
	};
	public static readonly ACTOR_SET_VALUE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initSetValue.name(),
		description: Language.LL.commandOptions.initSetValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
