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
		],
	};
	public static readonly ACTOR_SET_VALUE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.initSetValue.name(),
		description: Language.LL.commandOptions.initSetValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
