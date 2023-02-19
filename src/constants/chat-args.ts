import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';

import { InfoOption } from '../enums/index.js';
import { Language } from '../models/enum-helpers/index.js';
import { Lang } from '../services/index.js';

export class ChatArgs {
	public static readonly IMPORT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.wgUrl.name(),
		description: Language.LL.commandOptions.wgUrl.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly SET_ACTIVE_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.name.name(),
		description: Language.LL.commandOptions.name.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly SET_ACTIVE_ID_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.id.name(),
		description: Language.LL.commandOptions.id.description(),
		required: false,
		type: ApplicationCommandOptionType.Integer,
	};
	public static readonly ROLL_EXPRESSION_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.rollExpression.name(),
		description: Language.LL.commandOptions.rollExpression.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ROLL_SECRET_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.rollSecret.name(),
		description: Language.LL.commandOptions.rollSecret.description(),
		required: true,
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
			{
				name: Language.LL.commandOptions.rollSecret.choices.secretAndNotify.name(),
				value: Language.LL.commandOptions.rollSecret.choices.secretAndNotify.value(),
			},
		],
	};
	public static readonly SKILL_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.skillChoice.name(),
		description: Language.LL.commandOptions.skillChoice.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly SAVE_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.saveChoice.name(),
		description: Language.LL.commandOptions.saveChoice.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ABILITY_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.abilityChoice.name(),
		description: Language.LL.commandOptions.abilityChoice.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ATTACK_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.attackChoice.name(),
		description: Language.LL.commandOptions.attackChoice.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ROLL_MODIFIER_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.rollModifier.name(),
		description: Language.LL.commandOptions.rollModifier.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ATTACK_ROLL_MODIFIER_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.attackRollModifier.name(),
		description: Language.LL.commandOptions.attackRollModifier.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly DAMAGE_ROLL_MODIFIER_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.damageRollModifier.name(),
		description: Language.LL.commandOptions.damageRollModifier.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ROLL_NOTE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.rollNote.name(),
		description: Language.LL.commandOptions.rollNote.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_VALUE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initValue.name(),
		description: Language.LL.commandOptions.initValue.description(),
		required: false,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly INIT_CHARACTER_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initCharacter.name(),
		description: Language.LL.commandOptions.initCharacter.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly INIT_HP_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initHp.name(),
		description: Language.LL.commandOptions.initHp.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly INIT_MAX_HP_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initMaxHp.name(),
		description: Language.LL.commandOptions.initMaxHp.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly INIT_SP_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initSp.name(),
		description: Language.LL.commandOptions.initSp.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly INIT_MAX_SP_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initMaxSp.name(),
		description: Language.LL.commandOptions.initMaxSp.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly INIT_RP_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initRp.name(),
		description: Language.LL.commandOptions.initRp.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly INIT_MAX_RP_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initMaxRp.name(),
		description: Language.LL.commandOptions.initMaxRp.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly INIT_THP_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initThp.name(),
		description: Language.LL.commandOptions.initThp.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.Number,
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
				name: Language.LL.commandOptions.setOption.choices.hp.name(),
				value: Language.LL.commandOptions.setOption.choices.hp.value(),
			},
			{
				name: Language.LL.commandOptions.setOption.choices.maxHp.name(),
				value: Language.LL.commandOptions.setOption.choices.maxHp.value(),
			},
			{
				name: Language.LL.commandOptions.setOption.choices.sp.name(),
				value: Language.LL.commandOptions.setOption.choices.sp.value(),
			},
			{
				name: Language.LL.commandOptions.setOption.choices.maxSp.name(),
				value: Language.LL.commandOptions.setOption.choices.maxSp.value(),
			},
			{
				name: Language.LL.commandOptions.setOption.choices.rp.name(),
				value: Language.LL.commandOptions.setOption.choices.rp.value(),
			},
			{
				name: Language.LL.commandOptions.setOption.choices.maxRp.name(),
				value: Language.LL.commandOptions.setOption.choices.maxRp.value(),
			},
			{
				name: Language.LL.commandOptions.setOption.choices.thp.name(),
				value: Language.LL.commandOptions.setOption.choices.thp.value(),
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
