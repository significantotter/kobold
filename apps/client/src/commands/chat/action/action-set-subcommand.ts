import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { ActionCostEnum, ActionUpdate, Kobold, isActionTypeEnum } from '@kobold/db';

import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { ActionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = ActionDefinition.options;
const commandOptionsEnum = ActionDefinition.commandOptionsEnum;

export class ActionSetSubCommand extends BaseCommandClass(
	ActionDefinition,
	ActionDefinition.subCommandEnum.set
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.targetAction].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.targetAction].name) ?? '';

			//get the active character
			const { characterUtils } = new KoboldUtils(kobold);
			const activeCharacter = await characterUtils.getActiveCharacter(intr);
			if (!activeCharacter) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find an action on the character matching the autocomplete string
			const matchedActions = FinderHelpers.matchAllActions(
				activeCharacter.actions,
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
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const actionTarget = intr.options.getString(
			commandOptions[commandOptionsEnum.targetAction].name,
			true
		);
		const fieldToUpdate = intr.options.getString(
			commandOptions[commandOptionsEnum.setOption].name,
			true
		);
		const newValue = intr.options.getString(
			commandOptions[commandOptionsEnum.setValue].name,
			true
		);

		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});

		//find a roll on the character matching the autocomplete string
		const matchedAction = activeCharacter.actions.find(
			action => action.name.toLocaleLowerCase() === actionTarget.toLocaleLowerCase()
		);
		if (!matchedAction) {
			await InteractionUtils.send(intr, ActionDefinition.strings.notFound);
			return;
		}
		// just in case we need to set the name of the action, save it here
		const currentActionName = matchedAction.name;

		// build the update object based on which field is being updated
		const updateData: ActionUpdate = {};

		// validate the strings into different types based on which field is being updated

		// string values
		if (['name', 'description'].includes(fieldToUpdate)) {
			if (
				fieldToUpdate === 'name' &&
				!InputParseUtils.isValidString(fieldToUpdate, { maxLength: 50 })
			) {
				throw new KoboldError(
					`Yip! The counter group name must be less than 50 characters!`
				);
			}
			if (
				fieldToUpdate === 'description' &&
				!InputParseUtils.isValidString(fieldToUpdate, { maxLength: 300 })
			) {
				throw new KoboldError(
					`Yip! The counter group description must be less than 300 characters!`
				);
			}
			updateData[fieldToUpdate as 'name' | 'description'] = newValue.trim();
		}
		// enum values
		else if (fieldToUpdate === 'type') {
			const enumValue = newValue.toLocaleLowerCase().trim();
			if (isActionTypeEnum(enumValue)) {
				updateData.type = enumValue;
			} else {
				throw new KoboldError(ActionDefinition.strings.set.invalidActionType);
			}
		} else if (fieldToUpdate === 'actionCost') {
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
				updateData.actionCost = finalValue;
			} else {
				throw new KoboldError(ActionDefinition.strings.set.invalidActionCost);
			}
		}
		// integer values
		else if (['baseLevel'].includes(fieldToUpdate)) {
			const parsedValue = parseInt(newValue.trim());
			if (isNaN(parsedValue) || parsedValue < 1) {
				throw new KoboldError(ActionDefinition.strings.set.invalidInteger);
			} else {
				updateData.baseLevel = parsedValue;
			}
		}
		// string array values
		else if (['tags'].includes(fieldToUpdate)) {
			updateData.tags = newValue.split(',').map(tag => tag.trim());
		}

		// boolean values
		else if (['autoHeighten'].includes(fieldToUpdate)) {
			const autoHeighten = ['true', 'yes', '1', 'ok', 'okay'].includes(
				newValue.toLocaleLowerCase().trim()
			);
			updateData.autoHeighten = autoHeighten;
		} else {
			// invalid field
			throw new KoboldError(ActionDefinition.strings.set.unknownField);
		}

		await kobold.action.update({ id: matchedAction.id }, updateData);

		//send a confirmation message
		await InteractionUtils.send(
			intr,
			ActionDefinition.strings.set.success({
				actionOption: fieldToUpdate,
				newValue: newValue,
				actionName: currentActionName,
			})
		);
	}
}
