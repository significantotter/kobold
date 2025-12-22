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

export class ActionStageAddBasicDamageSubCommand extends BaseCommandClass(
	ActionStageDefinition,
	ActionStageDefinition.subCommandEnum.addBasicDamage
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
		const rollType = RollTypeEnum.damage;
		const rollName = intr.options.getString(
			commandOptions[commandOptionsEnum.rollName].name,
			true
		);
		const damageType = intr.options.getString(
			commandOptions[commandOptionsEnum.damageType].name
		);
		const healInsteadOfDamage =
			intr.options.getBoolean(commandOptions[commandOptionsEnum.healInsteadOfDamage].name) ??
			false;
		const basicDamageDiceRoll = intr.options.getString(
			commandOptions[commandOptionsEnum.basicDamageDiceRoll].name,
			true
		);
		let allowRollModifiers = intr.options.getBoolean(
			commandOptions[commandOptionsEnum.allowModifiers].name
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
			await InteractionUtils.send(intr, ActionStageDefinition.strings.notFound);
			return;
		}
		const action =
			matchedActions.find(
				action => action.name.toLocaleLowerCase() === targetAction.toLocaleLowerCase()
			) || matchedActions[0];

		if (action.rolls.find(roll => roll.name === rollName)) {
			await InteractionUtils.send(intr, ActionStageDefinition.strings.rollAlreadyExists);
			return;
		}

		// create the roll
		action.rolls.push({
			name: rollName,
			type: rollType,
			healInsteadOfDamage,
			roll: basicDamageDiceRoll,
			damageType: damageType,
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
			ActionStageDefinition.strings.rollAddSuccess({
				actionName: action.name,
				rollName: rollName,
				rollType: rollType,
			})
		);
	}
}
