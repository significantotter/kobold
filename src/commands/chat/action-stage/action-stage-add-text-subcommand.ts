import { Character, Game, GuildDefaultCharacter } from '../../../services/kobold/models/index.js';
import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
} from 'discord.js';

import { EventData } from '../../../models/internal-models.js';
import { InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Language } from '../../../models/enum-helpers/index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CollectorUtils } from '../../../utils/collector-utils.js';
import { CharacterUtils } from '../../../utils/character-utils.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { ActionStageOptions } from './action-stage-command-options.js';

export class ActionStageAddTextSubCommand implements Command {
	public names = [Language.LL.commands.actionStage.addText.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.actionStage.addText.name(),
		description: Language.LL.commands.actionStage.addText.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;
		if (option.name === ActionStageOptions.ACTION_TARGET_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ActionStageOptions.ACTION_TARGET_OPTION.name);

			return await AutocompleteUtils.getTargetActionForActiveCharacter(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const rollType = 'text';
		const rollName = intr.options.getString(ActionStageOptions.ACTION_ROLL_NAME_OPTION.name);
		const targetAction = intr.options.getString(ActionStageOptions.ACTION_TARGET_OPTION.name);
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

		//get the active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr.user.id, intr.guildId);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}

		// find the action
		const matchedActions = CharacterUtils.findPossibleActionFromString(
			activeCharacter,
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

		// save the character

		await Character.query().updateAndFetchById(activeCharacter.id, {
			actions: activeCharacter.actions,
		});

		// send the response message
		await InteractionUtils.send(
			intr,
			LL.commands.actionStage.interactions.rollAddSuccess({
				actionName: action.name,
				rollName: rollName,
				rollType: 'text',
			})
		);
	}
}
