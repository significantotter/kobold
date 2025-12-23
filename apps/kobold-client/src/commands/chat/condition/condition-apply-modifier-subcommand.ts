import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Kobold } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { ConditionDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = ConditionDefinition.options;
const commandOptionsEnum = ConditionDefinition.commandOptionsEnum;

export class ConditionApplyModifierSubCommand extends BaseCommandClass(
	ConditionDefinition,
	ConditionDefinition.subCommandEnum.applyModifier
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
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.name].name) ?? '';

			//get the active character
			const allCharacters = await kobold.character.readMany({ userId: intr.user.id });
			if (!allCharacters.length) {
				//no choices if we don't have a character to match against
				return [];
			}
			//find a save on the character matching the autocomplete string
			const allModifiers = allCharacters
				.map(character =>
					character.sheetRecord.modifiers.map(modifier => ({
						name: `${character.name} - ${modifier.name}`,
						value: `${character.name} - ${modifier.name}`,
					}))
				)
				.flat();

			const filteredModifiers = [];
			for (const modifier of allModifiers || []) {
				if (modifier.name.toLowerCase().includes(match.toLowerCase())) {
					filteredModifiers.push(modifier);
				}
			}
			return filteredModifiers;
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { gameUtils, characterUtils } = koboldUtils;
		const targetCharacter = intr.options.getString(
			commandOptions[commandOptionsEnum.targetCharacter].name,
			true
		);
		const { targetSheetRecord } = await gameUtils.getCharacterOrInitActorTarget(
			intr,
			targetCharacter
		);

		const targetModifierName = intr.options.getString(
			commandOptions[commandOptionsEnum.name].name,
			true
		);
		const [sourceCharacterName, conditionName] = targetModifierName
			.split(' - ')
			.map(s => s.trim());

		const sourceCharacter = (
			await characterUtils.findOwnedCharacterByName(sourceCharacterName, intr.user.id)
		)[0];
		const modifier = FinderHelpers.getModifierByName(
			sourceCharacter.sheetRecord,
			conditionName
		);
		if (!modifier) {
			throw new KoboldError(
				`Yip! I couldn't find the modifier ${conditionName} on ${sourceCharacterName}!`
			);
			return;
		}

		const modifierSeverity =
			intr.options.getString(commandOptions[commandOptionsEnum.severity].name) ?? null;

		const modifierSeverityValidated = InputParseUtils.parseAsNullableNumber(modifierSeverity);
		modifier.severity = modifierSeverityValidated;

		modifier.isActive = true;

		// make sure the name does't already exist in the character's modifiers
		if (FinderHelpers.getConditionByName(targetSheetRecord, conditionName)) {
			await InteractionUtils.send(
				intr,
				ConditionDefinition.strings.alreadyExists({
					conditionName: conditionName,
					characterName: targetSheetRecord.sheet.staticInfo.name,
				})
			);
			return;
		}

		await kobold.sheetRecord.update(
			{ id: targetSheetRecord.id },
			{
				conditions: [...targetSheetRecord.conditions, modifier],
			}
		);

		//send a response
		await InteractionUtils.send(
			intr,
			ConditionDefinition.strings.created({
				conditionName: conditionName,
				characterName: targetSheetRecord.sheet.staticInfo.name,
			})
		);
		return;
	}
}
