import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Action, Kobold } from '@kobold/db';

import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { ActionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import {
	parseCreateForValue,
	CreateForTargets,
} from '../../../utils/kobold-service-utils/autocomplete-utils.js';

const commandOptions = ActionDefinition.options;
const commandOptionsEnum = ActionDefinition.commandOptionsEnum;

export class ActionAssignSubCommand extends BaseCommandClass(
	ActionDefinition,
	ActionDefinition.subCommandEnum.assign
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const koboldUtils = new KoboldUtils(kobold);

		if (option.name === commandOptions[commandOptionsEnum.targetAction].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.targetAction].name) ?? '';

			// Get all user's actions for autocomplete
			const actions = await kobold.action.readManyByUser({
				userId: intr.user.id,
				filter: 'all',
			});

			const matchedActions = FinderHelpers.matchAllActions(actions, match).map(action => ({
				name: action.name,
				value: action.name,
			}));

			return matchedActions;
		}

		if (option.name === commandOptions[commandOptionsEnum.assignTo].name) {
			const match = intr.options.getString(commandOptions[commandOptionsEnum.assignTo].name);
			return koboldUtils.autocompleteUtils.getAssignToOptions(intr, match ?? '');
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);

		const actionTarget = intr.options.getString(
			commandOptions[commandOptionsEnum.targetAction].name,
			true
		);
		const assignToValue = intr.options.getString(
			commandOptions[commandOptionsEnum.assignTo].name,
			true
		);
		const copyOption = intr.options.getBoolean(commandOptions[commandOptionsEnum.copy].name);

		// Get characters and minions for parsing
		const { characters, minions } =
			await koboldUtils.autocompleteUtils.getUserCharactersAndMinions(intr);

		// Parse assign-to value
		const newSheetRecordId = parseCreateForValue(assignToValue, characters, minions);

		// Determine target name for messages
		let targetName: string;
		if (newSheetRecordId === null) {
			targetName = 'your user-wide actions';
		} else {
			const char = characters.find(c => c.sheetRecordId === newSheetRecordId);
			const minion = minions.find(m => m.sheetRecordId === newSheetRecordId);
			if (char) {
				targetName = char.name;
			} else if (minion) {
				targetName = minion.name;
			} else {
				throw new KoboldError(`Yip! Could not find a character or minion with that ID.`);
			}
		}

		// Find the action to assign
		const actions = await kobold.action.readManyByUser({
			userId: intr.user.id,
			filter: 'all',
		});

		const matchedAction = actions.find(
			(action: Action) => action.name.toLocaleLowerCase() === actionTarget.toLocaleLowerCase()
		);

		if (!matchedAction) {
			await InteractionUtils.send(intr, ActionDefinition.strings.notFound);
			return;
		}

		// Check if target already has an action with the same name
		let existingActions: Action[];
		if (newSheetRecordId === null) {
			existingActions = await kobold.action.readManyUserWide({
				userId: intr.user.id,
			});
		} else {
			existingActions = await kobold.action.readManyForCharacter({
				userId: intr.user.id,
				sheetRecordId: newSheetRecordId,
			});
		}

		if (FinderHelpers.getActionByName(existingActions, matchedAction.name)) {
			throw new KoboldError(
				ActionDefinition.strings.assign.alreadyExists({
					actionName: matchedAction.name,
					targetName,
				})
			);
		}

		if (copyOption) {
			// Create a copy instead of moving
			const { id, ...actionWithoutId } = matchedAction;
			await kobold.action.create({
				...actionWithoutId,
				sheetRecordId: newSheetRecordId,
				userId: intr.user.id,
			});

			await InteractionUtils.send(
				intr,
				ActionDefinition.strings.assign.copied({
					actionName: matchedAction.name,
					targetName,
				})
			);
		} else {
			// Move the action
			await kobold.action.update(
				{ id: matchedAction.id },
				{ sheetRecordId: newSheetRecordId }
			);

			await InteractionUtils.send(
				intr,
				ActionDefinition.strings.assign.success({
					actionName: matchedAction.name,
					targetName,
				})
			);
		}
	}
}
