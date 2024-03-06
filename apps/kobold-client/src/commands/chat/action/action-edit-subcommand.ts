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
import { ActionCostEnum, Kobold, isActionTypeEnum } from 'kobold-db';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { ActionOptions } from './action-command-options.js';

export class ActionEditSubCommand implements Command {
	public names = [L.en.commands.action.edit.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.action.edit.name(),
		description: L.en.commands.action.edit.description(),
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
		if (option.name === ActionOptions.ACTION_TARGET_OPTION.name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name) ?? '';

			//get the active character
			const { characterUtils } = new KoboldUtils(kobold);
			const activeCharacter = await characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find an action on the character matching the autocomplete string
			const matchedActions = FinderHelpers.matchAllActions(
				activeCharacter.sheetRecord,
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
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const actionTarget = intr.options.getString(ActionOptions.ACTION_TARGET_OPTION.name, true);
		const fieldToEdit = intr.options.getString(ActionOptions.ACTION_EDIT_OPTION.name, true);
		const newValue = intr.options.getString(ActionOptions.ACTION_EDIT_VALUE.name, true);

		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		//find a roll on the character matching the autocomplete string
		const matchedAction = activeCharacter.sheetRecord.actions.find(
			action => action.name.toLocaleLowerCase() === actionTarget.toLocaleLowerCase()
		);
		if (!matchedAction) {
			await InteractionUtils.send(intr, LL.commands.action.interactions.notFound());
			return;
		}
		// just in case we need to edit the name of the action, save it here
		const currentActionName = matchedAction.name;

		// validate the strings into different types based on which field is being edited

		// string values
		if (['name', 'description'].includes(fieldToEdit)) {
			matchedAction[fieldToEdit as 'name' | 'description'] = newValue.trim();
		}
		// enum values
		else if (fieldToEdit === 'type') {
			const enumValue = newValue.toLocaleLowerCase().trim();
			if (isActionTypeEnum(enumValue)) {
				matchedAction.type = enumValue;
			} else {
				throw new KoboldError(LL.commands.action.edit.interactions.invalidActionType());
			}
		} else if (fieldToEdit === 'actionCost') {
			const actionInputMap: Record<string, ActionCostEnum | undefined> = {
				one: ActionCostEnum.oneAction,
				two: ActionCostEnum.twoActions,
				three: ActionCostEnum.threeActions,
				free: ActionCostEnum.freeAction,
				variable: ActionCostEnum.variableActions,
				oneaction: ActionCostEnum.oneAction,
				twoactions: ActionCostEnum.twoActions,
				threeactions: ActionCostEnum.threeActions,
				freeaction: ActionCostEnum.freeAction,
				variableactions: ActionCostEnum.variableActions,
				reaction: ActionCostEnum.reaction,
			};
			let condensedActionCost = newValue.replaceAll(/[ \_-]/g, '').toLocaleLowerCase();

			let finalValue: ActionCostEnum | undefined = actionInputMap[condensedActionCost];

			if (finalValue) {
				matchedAction.actionCost = finalValue;
			} else {
				throw new KoboldError(LL.commands.action.edit.interactions.invalidActionCost());
			}
		}
		// integer values
		else if (['baseLevel'].includes(fieldToEdit)) {
			const parsedValue = parseInt(newValue.trim());
			if (isNaN(parsedValue) || parsedValue < 1) {
				throw new KoboldError(LL.commands.action.edit.interactions.invalidInteger());
			} else {
				matchedAction.baseLevel = parsedValue;
			}
		}
		// string array values
		else if (['tags'].includes(fieldToEdit)) {
			matchedAction.tags = newValue.split(',').map(tag => tag.trim());
		}

		// boolean values
		else if (['autoHeighten'].includes(fieldToEdit)) {
			const autoHeighten = ['true', 'yes', '1', 'ok', 'okay'].includes(
				newValue.toLocaleLowerCase().trim()
			);
			matchedAction.autoHeighten = autoHeighten;
		} else {
			// invalid field
			throw new KoboldError(LL.commands.action.edit.interactions.unknownField());
		}

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecordId },
			{ actions: activeCharacter.sheetRecord.actions }
		);

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
