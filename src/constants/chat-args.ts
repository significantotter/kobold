import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../i18n/i18n-node.js';

export class ChatArgs {
	public static readonly IMPORT_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.wgUrl.name(),
		description: L.en.commandOptions.wgUrl.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly SET_ACTIVE_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.name.name(),
		description: L.en.commandOptions.name.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly SET_ACTIVE_ID_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.id.name(),
		description: L.en.commandOptions.id.description(),
		required: false,
		type: ApplicationCommandOptionType.Integer,
	};
	public static readonly ROLL_EXPRESSION_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollExpression.name(),
		description: L.en.commandOptions.rollExpression.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ROLL_SECRET_OPTION: APIApplicationCommandBasicOption = {
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
			{
				name: L.en.commandOptions.rollSecret.choices.secretAndNotify.name(),
				value: L.en.commandOptions.rollSecret.choices.secretAndNotify.value(),
			},
			{
				name: L.en.commandOptions.rollSecret.choices.sendToGm.name(),
				value: L.en.commandOptions.rollSecret.choices.sendToGm.value(),
			},
		],
	};
	public static readonly SKILL_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.skillChoice.name(),
		description: L.en.commandOptions.skillChoice.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly SAVE_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.saveChoice.name(),
		description: L.en.commandOptions.saveChoice.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ABILITY_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.abilityChoice.name(),
		description: L.en.commandOptions.abilityChoice.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ATTACK_CHOICE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.attackChoice.name(),
		description: L.en.commandOptions.attackChoice.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ROLL_MODIFIER_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollModifier.name(),
		description: L.en.commandOptions.rollModifier.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ATTACK_ROLL_MODIFIER_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.attackRollModifier.name(),
		description: L.en.commandOptions.attackRollModifier.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly DAMAGE_ROLL_MODIFIER_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.damageRollModifier.name(),
		description: L.en.commandOptions.damageRollModifier.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly HEIGHTEN_LEVEL_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollHeightenLevel.name(),
		description: L.en.commandOptions.rollHeightenLevel.description(),
		required: false,
		type: ApplicationCommandOptionType.Integer,
	};
	public static readonly ROLL_TARGET_DC_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollTargetDc.name(),
		description: L.en.commandOptions.rollTargetDc.description(),
		required: false,
		type: ApplicationCommandOptionType.Integer,
	};
	public static readonly ROLL_TARGET_AC_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollTargetAC.name(),
		description: L.en.commandOptions.rollTargetAC.description(),
		required: false,
		type: ApplicationCommandOptionType.Integer,
	};
	public static readonly ROLL_SAVE_DICE_ROLL_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollSaveDiceRoll.name(),
		description: L.en.commandOptions.rollSaveDiceRoll.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ROLL_NOTE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.rollNote.name(),
		description: L.en.commandOptions.rollNote.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
