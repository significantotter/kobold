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
	public static readonly ACTION_TYPE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionType.name(),
		description: Language.LL.commandOptions.actionType.description(),
		required: true,
		choices: [
			{
				name: Language.LL.commandOptions.actionType.choices.attack.name(),
				value: Language.LL.commandOptions.actionType.choices.attack.value(),
			},
			{
				name: Language.LL.commandOptions.actionType.choices.spell.name(),
				value: Language.LL.commandOptions.actionType.choices.spell.value(),
			},
			{
				name: Language.LL.commandOptions.actionType.choices.other.name(),
				value: Language.LL.commandOptions.actionType.choices.other.value(),
			},
		],
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ACTIONS_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionActions.name(),
		description: Language.LL.commandOptions.actionActions.description(),
		required: true,
		choices: [
			{
				name: Language.LL.commandOptions.actionActions.choices.reaction.name(),
				value: Language.LL.commandOptions.actionActions.choices.reaction.value(),
			},
			{
				name: Language.LL.commandOptions.actionActions.choices.free.name(),
				value: Language.LL.commandOptions.actionActions.choices.free.value(),
			},
			{
				name: Language.LL.commandOptions.actionActions.choices.one.name(),
				value: Language.LL.commandOptions.actionActions.choices.one.value(),
			},
			{
				name: Language.LL.commandOptions.actionActions.choices.two.name(),
				value: Language.LL.commandOptions.actionActions.choices.two.value(),
			},
			{
				name: Language.LL.commandOptions.actionActions.choices.three.name(),
				value: Language.LL.commandOptions.actionActions.choices.three.value(),
			},
			{
				name: Language.LL.commandOptions.actionActions.choices.variable.name(),
				value: Language.LL.commandOptions.actionActions.choices.variable.value(),
			},
		],
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_BASE_LEVEL_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionBaseLevel.name(),
		description: Language.LL.commandOptions.actionBaseLevel.description(),
		required: false,
		type: ApplicationCommandOptionType.Integer,
	};
	public static readonly ACTION_AUTO_HEIGHTEN_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionAutoHeighten.name(),
		description: Language.LL.commandOptions.actionAutoHeighten.description(),
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly ACTION_TARGET_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionTarget.name(),
		description: Language.LL.commandOptions.actionTarget.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_ALLOW_MODIFIERS: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionRollAllowModifiers.name(),
		description: Language.LL.commandOptions.actionRollAllowModifiers.description(),
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly ACTION_ROLL_TARGET_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionRollTarget.name(),
		description: Language.LL.commandOptions.actionRollTarget.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_STAGE_EDIT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageEditOption.name(),
		description: Language.LL.commandOptions.actionStageEditOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.actionStageEditOption.choices.name.name(),
				value: Language.LL.commandOptions.actionStageEditOption.choices.name.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageEditOption.choices.targetDC.name(),
				value: Language.LL.commandOptions.actionStageEditOption.choices.targetDC.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageEditOption.choices.roll.name(),
				value: Language.LL.commandOptions.actionStageEditOption.choices.roll.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageEditOption.choices.successRoll.name(),
				value: Language.LL.commandOptions.actionStageEditOption.choices.successRoll.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageEditOption.choices.failureRoll.name(),
				value: Language.LL.commandOptions.actionStageEditOption.choices.failureRoll.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageEditOption.choices.criticalSuccessRoll.name(),
				value: Language.LL.commandOptions.actionStageEditOption.choices.criticalSuccessRoll.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageEditOption.choices.criticalFailureRoll.name(),
				value: Language.LL.commandOptions.actionStageEditOption.choices.criticalFailureRoll.value(),
			},
			{
				name: Language.LL.commandOptions.actionStageEditOption.choices.allowRollModifier.name(),
				value: Language.LL.commandOptions.actionStageEditOption.choices.allowRollModifier.value(),
			},
		],
	};
	public static readonly ACTION_EDIT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionEditOption.name(),
		description: Language.LL.commandOptions.actionEditOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.actionEditOption.choices.name.name(),
				value: Language.LL.commandOptions.actionEditOption.choices.name.value(),
			},
			{
				name: Language.LL.commandOptions.actionEditOption.choices.description.name(),
				value: Language.LL.commandOptions.actionEditOption.choices.description.value(),
			},
			{
				name: Language.LL.commandOptions.actionEditOption.choices.type.name(),
				value: Language.LL.commandOptions.actionEditOption.choices.type.value(),
			},
			{
				name: Language.LL.commandOptions.actionEditOption.choices.actionCost.name(),
				value: Language.LL.commandOptions.actionEditOption.choices.actionCost.value(),
			},
			{
				name: Language.LL.commandOptions.actionEditOption.choices.baseLevel.name(),
				value: Language.LL.commandOptions.actionEditOption.choices.baseLevel.value(),
			},
			{
				name: Language.LL.commandOptions.actionEditOption.choices.tags.name(),
				value: Language.LL.commandOptions.actionEditOption.choices.tags.value(),
			},
			{
				name: Language.LL.commandOptions.actionEditOption.choices.autoHeighten.name(),
				value: Language.LL.commandOptions.actionEditOption.choices.autoHeighten.value(),
			},
		],
	};
	public static readonly ACTION_Stage_Edit_VALUE: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionStageEditValue.name(),
		description: Language.LL.commandOptions.actionStageEditValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_TARGET_DC_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionRollSave.name(),
		description: Language.LL.commandOptions.actionRollSave.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_ABILITY_DC_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionRollAbilityDc.name(),
		description: Language.LL.commandOptions.actionRollSave.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_SAVE_ROLL_TYPE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionSaveRollType.name(),
		description: Language.LL.commandOptions.actionSaveRollType.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_ROLL_TYPE_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionRollType.name(),
		description: Language.LL.commandOptions.actionRollType.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.actionRollType.choices.attack.name(),
				value: Language.LL.commandOptions.actionRollType.choices.attack.value(),
			},
			{
				name: Language.LL.commandOptions.actionRollType.choices.damage.name(),
				value: Language.LL.commandOptions.actionRollType.choices.damage.value(),
			},
			{
				name: Language.LL.commandOptions.actionRollType.choices.other.name(),
				value: Language.LL.commandOptions.actionRollType.choices.other.value(),
			},
		],
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
	public static readonly ACTION_BASIC_DAMAGE_DICE_ROLL_OPTION: APIApplicationCommandBasicOption =
		{
			name: Language.LL.commandOptions.actionBasicDamageDiceRoll.name(),
			description: Language.LL.commandOptions.actionBasicDamageDiceRoll.description(),
			required: true,
			type: ApplicationCommandOptionType.String,
		};
	public static readonly ACTION_SUCCESS_DICE_ROLL_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionSuccessDiceRoll.name(),
		description: Language.LL.commandOptions.actionSuccessDiceRoll.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_CRITICAL_SUCCESS_DICE_ROLL_OPTION: APIApplicationCommandBasicOption =
		{
			name: Language.LL.commandOptions.actionCriticalSuccessDiceRoll.name(),
			description: Language.LL.commandOptions.actionCriticalSuccessDiceRoll.description(),
			required: false,
			type: ApplicationCommandOptionType.String,
		};
	public static readonly ACTION_CRITICAL_FAILURE_DICE_ROLL_OPTION: APIApplicationCommandBasicOption =
		{
			name: Language.LL.commandOptions.actionCriticalFailureDiceRoll.name(),
			description: Language.LL.commandOptions.actionCriticalFailureDiceRoll.description(),
			required: false,
			type: ApplicationCommandOptionType.String,
		};
	public static readonly ACTION_FAILURE_DICE_ROLL_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionFailureDiceRoll.name(),
		description: Language.LL.commandOptions.actionFailureDiceRoll.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_DEFAULT_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionDefaultText.name(),
		description: Language.LL.commandOptions.actionDefaultText.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_SUCCESS_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionSuccessText.name(),
		description: Language.LL.commandOptions.actionSuccessText.description({
			diceFormat: '{{1d20}}',
		}),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_CRITICAL_SUCCESS_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionCriticalSuccessText.name(),
		description: Language.LL.commandOptions.actionCriticalSuccessText.description({
			diceFormat: '{{1d20}}',
		}),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_CRITICAL_FAILURE_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionCriticalFailureText.name(),
		description: Language.LL.commandOptions.actionCriticalFailureText.description({
			diceFormat: '{{1d20}}',
		}),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_FAILURE_TEXT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionFailureText.name(),
		description: Language.LL.commandOptions.actionFailureText.description({
			diceFormat: '{{1d20}}',
		}),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_EXTRA_TAGS_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionExtraTags.name(),
		description: Language.LL.commandOptions.actionExtraTags.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly ACTION_TAGS_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.actionTags.name(),
		description: Language.LL.commandOptions.actionTags.description(),
		required: false,
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
