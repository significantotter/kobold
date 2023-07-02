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
import { ActionOptions } from './action-command-options.js';
import _ from 'lodash';

export class ActionEditSubCommand implements Command {
	public names = [Language.LL.commands.action.edit.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.action.edit.name(),
		description: Language.LL.commands.action.edit.description(),
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
		if (option.name === ActionOptions.ACTION_TARGET_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name);

			//get the active character
			const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find an action on the character matching the autocomplete string
			const matchedActions = CharacterUtils.findPossibleActionFromString(
				activeCharacter,
				match
			).map(action => ({
				name: action.name,
				value: action.name,
			}));
			//return the matched actions
			return matchedActions;
		}
	}
	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		const actionTarget = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name, true);
		const fieldToEdit = intr.options.getString(ActionOptions.ACTION_EDIT_OPTION.name, true);
		const newValue = intr.options.getString(ActionOptions.ACTION_EDIT_VALUE.name, true);

		//get the active character
		const activeCharacter = await CharacterUtils.getActiveCharacter(intr);
		if (!activeCharacter) {
			await InteractionUtils.send(
				intr,
				LL.commands.character.interactions.noActiveCharacter()
			);
			return;
		}

		//find a roll on the character matching the autocomplete string
		const matchedAction = activeCharacter.actions?.find(
			action => action.name.toLocaleLowerCase() === actionTarget.toLocaleLowerCase()
		);
		if (!matchedAction) {
			await InteractionUtils.send(intr, LL.commands.action.interactions.notFound());
			return;
		}
		// just in case we need to edit the name of the action, save it here
		const currentActionName = matchedAction.name;

		// validate the strings into different types based on which field is being edited
		let finalValue;

		// string values
		if (['name', 'description'].includes(fieldToEdit)) {
			finalValue = newValue.trim();
		}
		// enum values
		else if (['type', 'actionCost'].includes(fieldToEdit)) {
			if (fieldToEdit === 'type') {
				if (['attack', 'spell', 'other'].includes(newValue.toLocaleLowerCase().trim())) {
					finalValue = newValue.toLocaleLowerCase().trim();
				} else {
					await InteractionUtils.send(
						intr,
						LL.commands.action.edit.interactions.invalidActionType()
					);
					return;
				}
			} else if (fieldToEdit === 'actionCost') {
				const actionInputMap = {
					one: 'oneAction',
					two: 'twoActions',
					three: 'threeActions',
					free: 'freeAction',
					variable: 'variableActions',
					oneaction: 'oneAction',
					twoactions: 'twoActions',
					threeactions: 'threeActions',
					freeaction: 'freeAction',
					variableactions: 'variableActions',
					reaction: 'reaction',
				};
				let condensedActionCost = newValue.replaceAll(/[ \_-]/g, '').toLocaleLowerCase();
				if (_.keys(actionInputMap).includes(condensedActionCost)) {
					finalValue = actionInputMap[condensedActionCost];
				} else {
					await InteractionUtils.send(
						intr,
						LL.commands.action.edit.interactions.invalidActionCost()
					);
					return;
				}
			}
		}
		// integer values
		else if (['baseLevel'].includes(fieldToEdit)) {
			finalValue = parseInt(newValue.trim());
			if (isNaN(finalValue) || finalValue < 1) {
				await InteractionUtils.send(
					intr,
					LL.commands.action.edit.interactions.invalidInteger()
				);
			}
		}
		// string array values
		else if (['tags'].includes(fieldToEdit)) {
			finalValue = newValue.split(',').map(tag => tag.trim());
		}

		// boolean values
		else if (['autoHeighten'].includes(fieldToEdit)) {
			finalValue = ['true', 'yes', '1', 'ok', 'okay'].includes(
				newValue.toLocaleLowerCase().trim()
			);
		} else {
			// invalid field
			await InteractionUtils.send(intr, LL.commands.action.edit.interactions.unknownField());
		}

		matchedAction[fieldToEdit] = finalValue;

		await Character.query().updateAndFetchById(activeCharacter.id, {
			actions: activeCharacter.actions,
		});

		//send a confirmation message
		await InteractionUtils.send(
			intr,
			LL.commands.action.edit.interactions.success({
				actionOption: fieldToEdit,
				newValue: newValue,
				actionName: currentActionName,
			})
		);
	}
}
