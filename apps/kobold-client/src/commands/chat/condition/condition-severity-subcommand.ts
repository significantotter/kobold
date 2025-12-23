import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { ConditionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = ConditionDefinition.options;
const commandOptionsEnum = ConditionDefinition.commandOptionsEnum;
export class ConditionSeveritySubCommand extends BaseCommandClass(
	ConditionDefinition,
	ConditionDefinition.subCommandEnum.severity
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.targetCharacter].name) {
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.targetCharacter].name) ??
				'';
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return await autocompleteUtils.getAllTargetOptions(intr, match);
		}
		if (option.name === commandOptions[commandOptionsEnum.name].name) {
			//we don't need to autocomplete if we're just dealing with whitespace
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.name].name) ?? '';
			const targetCharacterName =
				intr.options.getString(commandOptions[commandOptionsEnum.targetCharacter].name) ??
				'';
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
		const conditionName = intr.options
			.getString(commandOptions[commandOptionsEnum.name].name, true)
			.trim();
		const newSeverity = intr.options
			.getString(commandOptions[commandOptionsEnum.severity].name, true)
			.toLocaleLowerCase()
			.trim();
		const targetCharacterName = intr.options.getString(
			commandOptions[commandOptionsEnum.targetCharacter].name,
			true
		);
		const { gameUtils } = new KoboldUtils(kobold);
		const targetCharacter = await gameUtils.getCharacterOrInitActorTarget(
			intr,
			targetCharacterName
		);

		//check if we have an active character

		const targetCondition = FinderHelpers.getConditionByName(
			targetCharacter.targetSheetRecord,
			conditionName
		);
		if (!targetCondition) {
			// no matching modifier found
			await InteractionUtils.send(intr, ConditionDefinition.strings.notFound);
			return;
		}
		targetCondition.severity = InputParseUtils.parseAsNullableNumber(newSeverity);

		await kobold.sheetRecord.update(
			{ id: targetCharacter.targetSheetRecord.id },
			{
				conditions: targetCharacter.targetSheetRecord.conditions,
			}
		);

		if (targetCondition.severity === null) {
			await InteractionUtils.send(
				intr,
				ConditionDefinition.strings.severity.removed({ conditionName })
			);
		} else {
			await InteractionUtils.send(
				intr,
				ConditionDefinition.strings.severity.updated({ conditionName, newSeverity })
			);
		}
	}
}
