import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { Kobold, RollTypeEnum } from '../../../services/kobold/index.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { ActionStageOptions } from './action-stage-command-options.js';

export class ActionStageAddAdvancedDamageSubCommand implements Command {
	public names = [L.en.commands.actionStage.addAdvancedDamage.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.actionStage.addAdvancedDamage.name(),
		description: L.en.commands.actionStage.addAdvancedDamage.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ActionStageOptions.ACTION_TARGET_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(ActionStageOptions.ACTION_TARGET_OPTION.name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getTargetActionForActiveCharacter(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetAction = intr.options.getString(
			ActionStageOptions.ACTION_TARGET_OPTION.name,
			true
		);
		const rollType = RollTypeEnum.advancedDamage;
		const rollName = intr.options.getString(
			ActionStageOptions.ACTION_ROLL_NAME_OPTION.name,
			true
		);
		const damageType = intr.options.getString(ActionStageOptions.ACTION_STAGE_DAMAGE_TYPE.name);
		const healInsteadOfDamage =
			intr.options.getBoolean(ActionStageOptions.ACTION_ROLL_HEAL_INSTEAD_OF_DAMAGE.name) ??
			false;
		const successDiceRoll = intr.options.getString(
			ActionStageOptions.ACTION_SUCCESS_DICE_ROLL_OPTION.name
		);
		const criticalSuccessDiceRoll = intr.options.getString(
			ActionStageOptions.ACTION_CRITICAL_SUCCESS_DICE_ROLL_OPTION.name
		);
		const criticalFailureDiceRoll = intr.options.getString(
			ActionStageOptions.ACTION_CRITICAL_FAILURE_DICE_ROLL_OPTION.name
		);
		const failureDiceRoll = intr.options.getString(
			ActionStageOptions.ACTION_FAILURE_DICE_ROLL_OPTION.name
		);
		let allowRollModifiers = intr.options.getBoolean(
			ActionStageOptions.ACTION_ROLL_ALLOW_MODIFIERS.name
		);
		if (allowRollModifiers === null) allowRollModifiers = true;

		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		// find the action
		const matchedActions = FinderHelpers.matchAllActions(
			activeCharacter.sheetRecord,
			targetAction
		);
		if (!matchedActions || !matchedActions.length) {
			await InteractionUtils.send(intr, LL.commands.actionStage.interactions.notFound());
			return;
		}
		const action =
			matchedActions.find(
				action => action.name.toLocaleLowerCase() === targetAction.toLocaleLowerCase()
			) || matchedActions[0];

		if (action.rolls.find(roll => roll.name === rollName)) {
			await InteractionUtils.send(
				intr,
				LL.commands.actionStage.interactions.rollAlreadyExists()
			);
			return;
		}

		if (
			!successDiceRoll &&
			!criticalSuccessDiceRoll &&
			!criticalFailureDiceRoll &&
			!failureDiceRoll
		) {
			await InteractionUtils.send(
				intr,
				LL.commands.actionStage.interactions.rollAlreadyExists()
			);
			return;
		}

		// create the roll
		action.rolls.push({
			name: rollName,
			type: rollType,
			damageType,
			healInsteadOfDamage,
			successRoll: successDiceRoll,
			criticalSuccessRoll: criticalSuccessDiceRoll,
			criticalFailureRoll: criticalFailureDiceRoll,
			failureRoll: failureDiceRoll,
			allowRollModifiers,
		});

		// save the sheet record
		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecordId },
			{ actions: activeCharacter.sheetRecord.actions }
		);

		// send the response message
		await InteractionUtils.send(
			intr,
			LL.commands.actionStage.interactions.rollAddSuccess({
				actionName: action.name,
				rollName: rollName,
				rollType: rollType,
			})
		);
	}
}
