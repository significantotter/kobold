import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import _ from 'lodash';
import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';
import { BaseCommandClass } from '../../command.js';
import { CounterGroupDefinition } from '@kobold/documentation';
const commandOptions = CounterGroupDefinition.options;
const commandOptionsEnum = CounterGroupDefinition.commandOptionsEnum;

export class CounterGroupSetSubCommand extends BaseCommandClass(
	CounterGroupDefinition,
	CounterGroupDefinition.subCommandEnum.set
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.counterGroupName].name) {
			const koboldUtils = new KoboldUtils(kobold);
			const autocompleteUtils = new AutocompleteUtils(koboldUtils);
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.counterGroupName].name) ??
				'';
			return autocompleteUtils.getCounterGroups(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});
		const targetCounterGroupName = intr.options.getString(
			commandOptions[commandOptionsEnum.counterGroupName].name,
			true
		);
		const newGroupOption = intr.options.getString(
			commandOptions[commandOptionsEnum.counterGroupSetOption].name,
			true
		);
		const newGroupValue = intr.options.getString(
			commandOptions[commandOptionsEnum.counterGroupSetValue].name,
			true
		);

		const targetCounterGroup = FinderHelpers.getCounterGroupByName(
			activeCharacter.sheetRecord.sheet.counterGroups,
			targetCounterGroupName
		);
		if (!targetCounterGroup) {
			throw new KoboldError(
				CounterGroupDefinition.strings.notFound({
					groupName: targetCounterGroupName,
				})
			);
		}

		if (newGroupOption === CounterGroupDefinition.optionChoices.setOption.name) {
			if (!InputParseUtils.isValidString(newGroupValue, { maxLength: 50 })) {
				throw new KoboldError(
					CounterGroupDefinition.strings.setStringTooLong({
						propertyName: 'name',
						numCharacters: 50,
					})
				);
			}
			targetCounterGroup.name = newGroupValue;
		} else if (newGroupOption === CounterGroupDefinition.optionChoices.setOption.description) {
			if (!InputParseUtils.isValidString(newGroupValue, { maxLength: 300 })) {
				throw new KoboldError(
					CounterGroupDefinition.strings.setStringTooLong({
						propertyName: 'description',
						numCharacters: 300,
					})
				);
			}
			targetCounterGroup.description = newGroupValue;
		} else {
			throw new KoboldError(CounterGroupDefinition.strings.setInvalidOption);
		}

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				sheet: activeCharacter.sheetRecord.sheet,
			}
		);

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			CounterGroupDefinition.strings.setSuccess.title({
				propertyName: newGroupOption,
				groupName: targetCounterGroup.name,
				newPropertyValue: newGroupValue,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
