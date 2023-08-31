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
import { ActionStageOptions } from './action-stage-command-options.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';

export class ActionStageAddSaveSubCommand implements Command {
	public names = [Language.LL.commands.actionStage.addSave.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.actionStage.addSave.name(),
		description: Language.LL.commands.actionStage.addSave.description(),
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
		} else if (option.name === ActionStageOptions.ACTION_SAVE_ROLL_TYPE_OPTION.name) {
			const match = intr.options.getString(
				ActionStageOptions.ACTION_SAVE_ROLL_TYPE_OPTION.name
			);
			return await AutocompleteUtils.getAllMatchingRollsForActiveCharacter(intr, match);
		} else if (option.name === ActionStageOptions.ACTION_ROLL_ABILITY_DC_OPTION.name) {
			const match = intr.options.getString(
				ActionStageOptions.ACTION_ROLL_ABILITY_DC_OPTION.name
			);
			return await AutocompleteUtils.getAllMatchingRollsForActiveCharacter(intr, match, [
				'AC',
				'Class DC',
				'Arcane DC',
				'Divine DC',
				'Occult DC',
				'Primal DC',
			]);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const targetAction = intr.options.getString(ActionStageOptions.ACTION_TARGET_OPTION.name);
		const rollType = 'save';
		const rollName = intr.options.getString(ActionStageOptions.ACTION_ROLL_NAME_OPTION.name);

		const saveRollType = intr.options.getString(
			ActionStageOptions.ACTION_SAVE_ROLL_TYPE_OPTION.name
		);
		const saveTargetDC = intr.options.getString(
			ActionStageOptions.ACTION_ROLL_ABILITY_DC_OPTION.name
		);

		//get the active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
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
				LL.commands.actionStage.addSave.interactions.requireText()
			);
			return;
		}

		// create the roll
		action.rolls.push({
			name: rollName,
			type: rollType,
			saveRollType,
			saveTargetDC,
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
				rollType: 'save',
			})
		);
	}
}
