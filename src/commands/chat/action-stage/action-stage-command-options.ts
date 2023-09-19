import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class ActionStageOptions {
	public static readonly ACTION_TARGET_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageTarget.name(),
		description: L.en.commandOptions.actionStageTarget.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_ALLOW_MODIFIERS: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageRollAllowModifiers.name(),
		description: L.en.commandOptions.actionStageRollAllowModifiers.description(),
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly ACTION_ROLL_HEAL_INSTEAD_OF_DAMAGE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageRollHealInsteadOfDamage.name(),
		description: L.en.commandOptions.actionStageRollHealInsteadOfDamage.description(),
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly ACTION_ROLL_TARGET_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageRollTarget.name(),
		description: L.en.commandOptions.actionStageRollTarget.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_STAGE_EDIT_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageStageEditOption.name(),
		description: L.en.commandOptions.actionStageStageEditOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.name.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.name.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.damageType.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.damageType.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.allowRollModifier.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.allowRollModifier.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.attackTargetDC.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.attackTargetDC.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.attackRoll.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.attackRoll.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.basicDamageRoll.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.basicDamageRoll.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.advancedDamageCritSuccessRoll.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.advancedDamageCritSuccessRoll.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.advancedDamageSuccessRoll.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.advancedDamageSuccessRoll.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.advancedDamageFailureRoll.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.advancedDamageFailureRoll.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.advancedDamageCritFailureRoll.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.advancedDamageCritFailureRoll.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.saveRollType.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.saveRollType.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.saveTargetDC.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.saveTargetDC.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.defaultText.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.defaultText.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.successText.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.successText.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.failureText.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.failureText.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.criticalSuccessText.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.criticalSuccessText.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.criticalFailureText.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.criticalFailureText.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageEditOption.choices.textExtraTags.name(),
				value: L.en.commandOptions.actionStageStageEditOption.choices.textExtraTags.value(),
			},
		],
	};
	public static readonly ACTION_STAGE_EDIT_VALUE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageEditValue.name(),
		description: L.en.commandOptions.actionStageEditValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_STAGE_MOVE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageStageMoveOption.name(),
		description: L.en.commandOptions.actionStageStageMoveOption.description(),
		required: false,
		choices: [
			{
				name: L.en.commandOptions.actionStageStageMoveOption.choices.top.name(),
				value: L.en.commandOptions.actionStageStageMoveOption.choices.top.value(),
			},
			{
				name: L.en.commandOptions.actionStageStageMoveOption.choices.bottom.name(),
				value: L.en.commandOptions.actionStageStageMoveOption.choices.bottom.value(),
			},
		],
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_TARGET_DC_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageRollSave.name(),
		description: L.en.commandOptions.actionStageRollSave.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_ABILITY_DC_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageRollAbilityDc.name(),
		description: L.en.commandOptions.actionStageRollSave.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_SAVE_ROLL_TYPE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageSaveRollType.name(),
		description: L.en.commandOptions.actionStageSaveRollType.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_TYPE_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageRollType.name(),
		description: L.en.commandOptions.actionStageRollType.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.actionStageRollType.choices.attack.name(),
				value: L.en.commandOptions.actionStageRollType.choices.attack.value(),
			},
			{
				name: L.en.commandOptions.actionStageRollType.choices.damage.name(),
				value: L.en.commandOptions.actionStageRollType.choices.damage.value(),
			},
			{
				name: L.en.commandOptions.actionStageRollType.choices.other.name(),
				value: L.en.commandOptions.actionStageRollType.choices.other.value(),
			},
		],
	};
	public static readonly ACTION_ROLL_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageRollName.name(),
		description: L.en.commandOptions.actionStageRollName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_DICE_ROLL_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageDiceRoll.name(),
		description: L.en.commandOptions.actionStageDiceRoll.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_STAGE_DAMAGE_TYPE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageDamageType.name(),
		description: L.en.commandOptions.actionStageDamageType.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_BASIC_DAMAGE_DICE_ROLL_OPTION: APIApplicationCommandBasicOption =
		{
			name: L.en.commandOptions.actionStageBasicDamageDiceRoll.name(),
			description: L.en.commandOptions.actionStageBasicDamageDiceRoll.description(),
			required: true,
			type: ApplicationCommandOptionType.String,
		};
	public static readonly ACTION_SUCCESS_DICE_ROLL_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageSuccessDiceRoll.name(),
		description: L.en.commandOptions.actionStageSuccessDiceRoll.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_CRITICAL_SUCCESS_DICE_ROLL_OPTION: APIApplicationCommandBasicOption =
		{
			name: L.en.commandOptions.actionStageCriticalSuccessDiceRoll.name(),
			description: L.en.commandOptions.actionStageCriticalSuccessDiceRoll.description(),
			required: false,
			type: ApplicationCommandOptionType.String,
		};
	public static readonly ACTION_CRITICAL_FAILURE_DICE_ROLL_OPTION: APIApplicationCommandBasicOption =
		{
			name: L.en.commandOptions.actionStageCriticalFailureDiceRoll.name(),
			description: L.en.commandOptions.actionStageCriticalFailureDiceRoll.description(),
			required: false,
			type: ApplicationCommandOptionType.String,
		};
	public static readonly ACTION_FAILURE_DICE_ROLL_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageFailureDiceRoll.name(),
		description: L.en.commandOptions.actionStageFailureDiceRoll.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_DEFAULT_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageDefaultText.name(),
		description: L.en.commandOptions.actionStageDefaultText.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_SUCCESS_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageSuccessText.name(),
		description: L.en.commandOptions.actionStageSuccessText.description({
			diceFormat: '{{1d20}}',
		}),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_CRITICAL_SUCCESS_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageCriticalSuccessText.name(),
		description: L.en.commandOptions.actionStageCriticalSuccessText.description({
			diceFormat: '{{1d20}}',
		}),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_CRITICAL_FAILURE_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageCriticalFailureText.name(),
		description: L.en.commandOptions.actionStageCriticalFailureText.description({
			diceFormat: '{{1d20}}',
		}),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_FAILURE_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageFailureText.name(),
		description: L.en.commandOptions.actionStageFailureText.description({
			diceFormat: '{{1d20}}',
		}),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_EXTRA_TAGS_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.actionStageExtraTags.name(),
		description: L.en.commandOptions.actionStageExtraTags.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
}
