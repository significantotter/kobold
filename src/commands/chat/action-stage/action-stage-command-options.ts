import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class ActionStageOptions {
	public static readonly ACTION_TARGET_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageTarget.name(),
		description: Language.LL.commandOptions.actionStageTarget.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_ALLOW_MODIFIERS: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageRollAllowModifiers.name(),
		description: Language.LL.commandOptions.actionStageRollAllowModifiers.description(),
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly ACTION_ROLL_HEAL_INSTEAD_OF_DAMAGE: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageRollHealInsteadOfDamage.name(),
		description: Language.LL.commandOptions.actionStageRollHealInsteadOfDamage.description(),
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly ACTION_ROLL_TARGET_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageRollTarget.name(),
		description: Language.LL.commandOptions.actionStageRollTarget.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_STAGE_EDIT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageStageEditOption.name(),
		description: Language.LL.commandOptions.actionStageStageEditOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.name.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.name.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.damageType.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.damageType.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.allowRollModifier.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.allowRollModifier.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.attackTargetDC.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.attackTargetDC.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.attackRoll.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.attackRoll.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.basicDamageRoll.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.basicDamageRoll.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.advancedDamageCritSuccessRoll.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.advancedDamageCritSuccessRoll.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.advancedDamageSuccessRoll.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.advancedDamageSuccessRoll.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.advancedDamageFailureRoll.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.advancedDamageFailureRoll.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.advancedDamageCritFailureRoll.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.advancedDamageCritFailureRoll.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.saveRollType.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.saveRollType.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.saveTargetDC.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.saveTargetDC.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.defaultText.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.defaultText.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.successText.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.successText.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.failureText.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.failureText.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.criticalSuccessText.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.criticalSuccessText.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.criticalFailureText.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.criticalFailureText.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageEditOption.choices.textExtraTags.name(),
				value: Language.LL.commandOptions.actionStageStageEditOption.choices.textExtraTags.value(),
			},
		],
	};
	public static readonly ACTION_STAGE_EDIT_VALUE: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageEditValue.name(),
		description: Language.LL.commandOptions.actionStageEditValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_STAGE_MOVE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageStageMoveOption.name(),
		description: Language.LL.commandOptions.actionStageStageMoveOption.description(),
		required: false,
		choices: [
			{
				name: Language.LL.commandOptions.actionStageStageMoveOption.choices.top.name(),
				value: Language.LL.commandOptions.actionStageStageMoveOption.choices.top.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageStageMoveOption.choices.bottom.name(),
				value: Language.LL.commandOptions.actionStageStageMoveOption.choices.bottom.value(),
			},
		],
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_TARGET_DC_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageRollSave.name(),
		description: Language.LL.commandOptions.actionStageRollSave.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_ABILITY_DC_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageRollAbilityDc.name(),
		description: Language.LL.commandOptions.actionStageRollSave.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_SAVE_ROLL_TYPE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageSaveRollType.name(),
		description: Language.LL.commandOptions.actionStageSaveRollType.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_TYPE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageRollType.name(),
		description: Language.LL.commandOptions.actionStageRollType.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.actionStageRollType.choices.attack.name(),
				value: Language.LL.commandOptions.actionStageRollType.choices.attack.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageRollType.choices.damage.name(),
				value: Language.LL.commandOptions.actionStageRollType.choices.damage.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageRollType.choices.other.name(),
				value: Language.LL.commandOptions.actionStageRollType.choices.other.value(),
			},
		],
	};
	public static readonly ACTION_ROLL_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageRollName.name(),
		description: Language.LL.commandOptions.actionStageRollName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_DICE_ROLL_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageDiceRoll.name(),
		description: Language.LL.commandOptions.actionStageDiceRoll.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_STAGE_DAMAGE_TYPE: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageDamageType.name(),
		description: Language.LL.commandOptions.actionStageDamageType.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_BASIC_DAMAGE_DICE_ROLL_OPTION: APIApplicationCommandBasicOption =
		{
			name: Language.LL.commandOptions.actionStageBasicDamageDiceRoll.name(),
			description: Language.LL.commandOptions.actionStageBasicDamageDiceRoll.description(),
			required: true,
			type: ApplicationCommandOptionType.String,
		};
	public static readonly ACTION_SUCCESS_DICE_ROLL_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageSuccessDiceRoll.name(),
		description: Language.LL.commandOptions.actionStageSuccessDiceRoll.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_CRITICAL_SUCCESS_DICE_ROLL_OPTION: APIApplicationCommandBasicOption =
		{
			name: Language.LL.commandOptions.actionStageCriticalSuccessDiceRoll.name(),
			description:
				Language.LL.commandOptions.actionStageCriticalSuccessDiceRoll.description(),
			required: false,
			type: ApplicationCommandOptionType.String,
		};
	public static readonly ACTION_CRITICAL_FAILURE_DICE_ROLL_OPTION: APIApplicationCommandBasicOption =
		{
			name: Language.LL.commandOptions.actionStageCriticalFailureDiceRoll.name(),
			description:
				Language.LL.commandOptions.actionStageCriticalFailureDiceRoll.description(),
			required: false,
			type: ApplicationCommandOptionType.String,
		};
	public static readonly ACTION_FAILURE_DICE_ROLL_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageFailureDiceRoll.name(),
		description: Language.LL.commandOptions.actionStageFailureDiceRoll.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_DEFAULT_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageDefaultText.name(),
		description: Language.LL.commandOptions.actionStageDefaultText.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_SUCCESS_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageSuccessText.name(),
		description: Language.LL.commandOptions.actionStageSuccessText.description({
			diceFormat: '{{1d20}}',
		}),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_CRITICAL_SUCCESS_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageCriticalSuccessText.name(),
		description: Language.LL.commandOptions.actionStageCriticalSuccessText.description({
			diceFormat: '{{1d20}}',
		}),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_CRITICAL_FAILURE_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageCriticalFailureText.name(),
		description: Language.LL.commandOptions.actionStageCriticalFailureText.description({
			diceFormat: '{{1d20}}',
		}),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_FAILURE_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageFailureText.name(),
		description: Language.LL.commandOptions.actionStageFailureText.description({
			diceFormat: '{{1d20}}',
		}),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_EXTRA_TAGS_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageExtraTags.name(),
		description: Language.LL.commandOptions.actionStageExtraTags.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
}
