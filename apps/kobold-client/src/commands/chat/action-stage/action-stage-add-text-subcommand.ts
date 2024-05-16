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
import { Kobold, RollTypeEnum } from '@kobold/db';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { ActionStageOptions } from './action-stage-command-options.js';

export class ActionStageAddTextSubCommand implements Command {
	public names = [L.en.commands.actionStage.addText.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.actionStage.addText.name(),
		description: L.en.commands.actionStage.addText.description({
			addTextRollInput: '{{}}',
		}),
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
		const rollType = RollTypeEnum.text;
		const rollName = intr.options.getString(
			ActionStageOptions.ACTION_ROLL_NAME_OPTION.name,
			true
		);
		const targetAction = intr.options.getString(
			ActionStageOptions.ACTION_TARGET_OPTION.name,
			true
		);
		const defaultText = intr.options.getString(
			ActionStageOptions.ACTION_DEFAULT_TEXT_OPTION.name
		);
		const successText = intr.options.getString(
			ActionStageOptions.ACTION_SUCCESS_TEXT_OPTION.name
		);
		const criticalSuccessText = intr.options.getString(
			ActionStageOptions.ACTION_CRITICAL_SUCCESS_TEXT_OPTION.name
		);
		const criticalFailureText = intr.options.getString(
			ActionStageOptions.ACTION_CRITICAL_FAILURE_TEXT_OPTION.name
		);
		const failureText = intr.options.getString(
			ActionStageOptions.ACTION_FAILURE_TEXT_OPTION.name
		);
		const extraTags = intr.options.getString(ActionStageOptions.ACTION_EXTRA_TAGS_OPTION.name);
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
			(defaultText ?? '').length +
				(successText ?? '').length +
				(criticalSuccessText ?? '').length +
				(criticalFailureText ?? '').length +
				(failureText ?? '').length >
			900
		) {
			await InteractionUtils.send(
				intr,
				LL.commands.actionStage.addText.interactions.tooMuchText()
			);
			return;
		}

		if (
			!defaultText &&
			!successText &&
			!criticalSuccessText &&
			!criticalFailureText &&
			!failureText
		) {
			await InteractionUtils.send(
				intr,
				LL.commands.actionStage.addText.interactions.requireText()
			);
			return;
		}

		// create the roll
		action.rolls.push({
			name: rollName,
			type: rollType,
			defaultText,
			successText,
			criticalSuccessText,
			criticalFailureText,
			failureText,
			allowRollModifiers,
			extraTags: extraTags ? extraTags.split(',').map(tag => tag.trim()) : [],
		});

		// save the actions
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
