import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Kobold, RollTypeEnum } from '@kobold/db';

import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { ActionStageDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = ActionStageDefinition.options;
const commandOptionsEnum = ActionStageDefinition.commandOptionsEnum;

export class ActionStageAddSaveSubCommand extends BaseCommandClass(
	ActionStageDefinition,
	ActionStageDefinition.subCommandEnum.addSave
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.actionTarget].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.actionTarget].name) ?? '';

			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getTargetActionForActiveCharacter(intr, match);
		} else if (option.name === commandOptions[commandOptionsEnum.saveRollType].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.saveRollType].name) ?? '';
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllMatchingStatRollsForActiveCharacter(intr, match);
		} else if (option.name === commandOptions[commandOptionsEnum.abilityDc].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.abilityDc].name) ?? '';
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllMatchingStatRollsForActiveCharacter(intr, match, [
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
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetAction = intr.options.getString(
			commandOptions[commandOptionsEnum.actionTarget].name,
			true
		);
		const rollType = RollTypeEnum.save;
		const rollName = intr.options.getString(
			commandOptions[commandOptionsEnum.rollName].name,
			true
		);

		const saveRollType = intr.options.getString(
			commandOptions[commandOptionsEnum.saveRollType].name,
			true
		);
		const saveTargetDC = intr.options.getString(
			commandOptions[commandOptionsEnum.abilityDc].name
		);

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
			await InteractionUtils.send(intr, ActionStageDefinition.strings.notFound);
			return;
		}
		const action =
			matchedActions.find(
				action => action.name.toLocaleLowerCase() === targetAction.toLocaleLowerCase()
			) || matchedActions[0];

		if (action.rolls.find(roll => roll.name === rollName)) {
			await InteractionUtils.send(intr, ActionStageDefinition.strings.addSave.requireText);
			return;
		}

		// create the roll
		action.rolls.push({
			name: rollName,
			type: rollType,
			saveRollType,
			saveTargetDC,
			allowRollModifiers: true,
		});

		// save the character
		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecordId },
			{ actions: activeCharacter.sheetRecord.actions }
		);

		// send the response message
		await InteractionUtils.send(
			intr,
			ActionStageDefinition.strings.rollAddSuccess({
				actionName: action.name,
				rollName: rollName,
				rollType: rollType,
			})
		);
	}
}
