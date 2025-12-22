import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Kobold, SheetAdjustmentTypeEnum } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { Creature } from '../../../utils/creature.js';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import _ from 'lodash';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { StringUtils } from '@kobold/base-utils';
import { ConditionDefinition, GameplayDefinition, ModifierDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = ConditionDefinition.options;
const commandOptionsEnum = ConditionDefinition.commandOptionsEnum;
const gameplayCommandOptions = GameplayDefinition.options;
const gameplayCommandOptionsEnum = GameplayDefinition.commandOptionsEnum;
const modifierCommandOptions = ModifierDefinition.options;
const modifierCommandOptionsEnum = ModifierDefinition.commandOptionsEnum;

export class ConditionSetSubCommand extends BaseCommandClass(
	ConditionDefinition,
	ConditionDefinition.subCommandEnum.set
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (
			option.name ===
			gameplayCommandOptions[gameplayCommandOptionsEnum.gameplayTargetCharacter].name
		) {
			const match =
				intr.options.getString(
					gameplayCommandOptions[gameplayCommandOptionsEnum.gameplayTargetCharacter].name
				) ?? '';
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
		if (option.name === commandOptions[commandOptionsEnum.name].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.name].name) ?? '';
			const targetCharacterName =
				intr.options.getString(
					gameplayCommandOptions[gameplayCommandOptionsEnum.gameplayTargetCharacter].name
				) ?? '';
			const { autocompleteUtils } = new KoboldUtils(kobold);
			try {
				return autocompleteUtils.getConditionsOnTarget(intr, targetCharacterName, match);
			} catch (err) {
				// failed to match a target, so return []
				return [];
			}
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const targetCharacterName = intr.options
			.getString(
				gameplayCommandOptions[gameplayCommandOptionsEnum.gameplayTargetCharacter].name,
				true
			)
			.trim();
		const conditionName = intr.options
			.getString(commandOptions[commandOptionsEnum.name].name, true)
			.trim();
		let fieldToChange = intr.options
			.getString(modifierCommandOptions[modifierCommandOptionsEnum.setOption].name, true)
			.toLocaleLowerCase()
			.trim();
		const newFieldValue = intr.options
			.getString(modifierCommandOptions[modifierCommandOptionsEnum.setValue].name, true)
			.trim();

		//check if we have an active character
		const { gameUtils } = new KoboldUtils(kobold);
		const { targetSheetRecord, targetName } = await gameUtils.getCharacterOrInitActorTarget(
			intr,
			targetCharacterName
		);

		const targetCondition = FinderHelpers.getConditionByName(targetSheetRecord, conditionName);
		if (!targetCondition) {
			// no matching condition found
			await InteractionUtils.send(intr, ConditionDefinition.strings.notFound);
			return;
		}

		// validate the updates
		if (fieldToChange === ConditionDefinition.optionChoices.setOption.name) {
			if (FinderHelpers.getModifierByName(targetSheetRecord, newFieldValue)) {
				throw new KoboldError(ConditionDefinition.strings.set.nameExistsError);
			} else {
				targetCondition.name = InputParseUtils.parseAsString(newFieldValue, {
					inputName: fieldToChange,
					minLength: 3,
					maxLength: 20,
				});
			}
		} else if (fieldToChange === ConditionDefinition.optionChoices.setOption.rollAdjustment) {
			try {
				// we must be able to evaluate the condition as a roll for this character
				InputParseUtils.isValidDiceExpression(
					newFieldValue,
					new Creature(targetSheetRecord, undefined, intr)
				);
				targetCondition.rollAdjustment = newFieldValue;
			} catch (err) {
				await InteractionUtils.send(intr, ConditionDefinition.strings.doesntEvaluateError);
				return;
			}
		} else if (fieldToChange === ConditionDefinition.optionChoices.setOption.rollTargetTags) {
			fieldToChange = 'rollTargetTags';
			// parse the target tags
			if (!InputParseUtils.isValidRollTargetTags(newFieldValue)) {
				// the tags are in an invalid format
				throw new KoboldError(ConditionDefinition.strings.invalidTags);
			}
			targetCondition.rollTargetTags = newFieldValue;
		} else if (fieldToChange === 'type') {
			const newType = newFieldValue.trim().toLowerCase();
			if (!newType) targetCondition.type = SheetAdjustmentTypeEnum.untyped;
			else if (newType in SheetAdjustmentTypeEnum) {
				targetCondition.type = newType as SheetAdjustmentTypeEnum;
			} else {
				throw new KoboldError(
					`Yip! The type must be one of ${StringUtils.stringsToCommaPhrase(
						Object.values(SheetAdjustmentTypeEnum)
					)}.`
				);
			}
		} else if (fieldToChange === 'description') {
			targetCondition.description = InputParseUtils.parseAsNullableString(newFieldValue, {
				inputName: fieldToChange,
				maxLength: 300,
			});
			if (!newFieldValue) targetCondition.description = null;
			else targetCondition.description = newFieldValue;
		} else if (fieldToChange === 'initiative-note') {
			if (!newFieldValue) targetCondition.note = null;
			else
				targetCondition.note = InputParseUtils.parseAsNullableString(newFieldValue, {
					inputName: fieldToChange,
					maxLength: 40,
				});
		} else if (fieldToChange === 'severity') {
			if (newFieldValue == null) targetCondition.severity = null;
			else targetCondition.severity = InputParseUtils.parseAsNumber(newFieldValue);
		} else if (fieldToChange === 'sheet-values') {
			targetCondition.sheetAdjustments = InputParseUtils.parseAsSheetAdjustments(
				newFieldValue,
				targetCondition.type
			);
		} else {
			// if a field wasn't provided, or the field isn't present in our options, send an error
			await InteractionUtils.send(intr, ConditionDefinition.strings.set.invalidOptionError);
			return;
		}
		// just in case the update is for the name
		const nameBeforeUpdate = targetCondition.name;

		await kobold.sheetRecord.update(
			{ id: targetSheetRecord.id },
			{
				conditions: targetSheetRecord.conditions,
			}
		);

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			ConditionDefinition.strings.set.successEmbed.title({
				characterName: targetName,
				conditionName: nameBeforeUpdate,
				fieldToChange,
				newFieldValue,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
