import {
	APIApplicationCommandBasicOption,
	APIApplicationCommandStringOption,
	ApplicationCommandOptionType,
} from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class InitOptions {
	public static readonly INIT_VALUE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initValue.name(),
		description: L.en.commandOptions.initValue.description(),
		required: false,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly INIT_NOTE_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.initValue.name(),
		description: L.en.commandOptions.initValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_ADD_TEMPLATE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.template.name(),
		description: L.en.commandOptions.template.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.template.choices.normal.name(),
				value: L.en.commandOptions.template.choices.normal.value(),
			},
			{
				name: L.en.commandOptions.template.choices.elite.name(),
				value: L.en.commandOptions.template.choices.elite.value(),
			},
			{
				name: L.en.commandOptions.template.choices.weak.name(),
				value: L.en.commandOptions.template.choices.weak.value(),
			},
		],
	};
	public static readonly INIT_HIDE_STATS_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initHideStats.name(),
		description: L.en.commandOptions.initHideStats.description(),
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly INIT_CUSTOM_STATS_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initCustomStats.name(),
		description: L.en.commandOptions.initCustomStats.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_CHARACTER_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initCharacter.name(),
		description: L.en.commandOptions.initCharacter.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_CHARACTER_TARGET: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initCharacterTarget.name(),
		description: L.en.commandOptions.initCharacterTarget.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_STAT_BLOCK_SECRET_OPTION: APIApplicationCommandBasicOption = {
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
		],
	};
	public static readonly INIT_TARGET_ACTOR_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initTargetActor.name(),
		description: L.en.commandOptions.initTargetActor.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_ROLL_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initRollChoice.name(),
		description: L.en.commandOptions.initRollChoice.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_CREATURE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initCreature.name(),
		description: L.en.commandOptions.initCreature.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTOR_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initActor.name(),
		description: L.en.commandOptions.initActor.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTOR_SET_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initSetOption.name(),
		description: L.en.commandOptions.initSetOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.initSetOption.choices.initiative.name(),
				value: L.en.commandOptions.initSetOption.choices.initiative.value(),
			},
			{
				name: L.en.commandOptions.initSetOption.choices.actorName.name(),
				value: L.en.commandOptions.initSetOption.choices.actorName.value(),
			},
			{
				name: L.en.commandOptions.initSetOption.choices.isGm.name(),
				value: L.en.commandOptions.initSetOption.choices.isGm.value(),
			},
			{
				name: L.en.commandOptions.initSetOption.choices.hideStats.name(),
				value: L.en.commandOptions.initSetOption.choices.hideStats.value(),
			},
		],
	};
	public static readonly ACTOR_SET_VALUE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.initSetValue.name(),
		description: L.en.commandOptions.initSetValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
