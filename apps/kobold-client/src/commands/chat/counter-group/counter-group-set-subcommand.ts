import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import _ from 'lodash';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { CounterGroupOptions } from './counter-group-command-options.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';
import { BaseCommandClass } from '../../command.js';
import { CounterGroupCommand } from '@kobold/documentation';

export class CounterGroupSetSubCommand extends BaseCommandClass(
	CounterGroupCommand,
	CounterGroupCommand.subCommandEnum.set
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === CounterGroupOptions.COUNTER_GROUP_NAME_OPTION.name) {
			const koboldUtils = new KoboldUtils(kobold);
			const autocompleteUtils = new AutocompleteUtils(koboldUtils);
			const match =
				intr.options.getString(CounterGroupOptions.COUNTER_GROUP_NAME_OPTION.name) ?? '';
			return autocompleteUtils.getCounterGroups(intr, match);
		}
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});
		const targetCounterGroupName = intr.options.getString(
			CounterGroupOptions.COUNTER_GROUP_NAME_OPTION.name,
			true
		);
		const newGroupOption = intr.options.getString(
			CounterGroupOptions.COUNTER_GROUP_SET_OPTION_OPTION.name,
			true
		);
		const newGroupValue = intr.options.getString(
			CounterGroupOptions.COUNTER_GROUP_SET_VALUE_OPTION.name,
			true
		);

		const targetCounterGroup = FinderHelpers.getCounterGroupByName(
			activeCharacter.sheetRecord.sheet.counterGroups,
			targetCounterGroupName
		);
		if (!targetCounterGroup) {
			throw new KoboldError(
				LL.commands.counterGroup.interactions.notFound({
					groupName: targetCounterGroupName,
				})
			);
		}

		if (newGroupOption === L.en.commandOptions.counterGroupSetOption.choices.name.value()) {
			if (!InputParseUtils.isValidString(newGroupValue, { maxLength: 50 })) {
				throw new KoboldError(
					LL.commands.counterGroup.set.interactions.stringTooLong({
						propertyName: 'name',
						numCharacters: 50,
					})
				);
			}
			targetCounterGroup.name = newGroupValue;
		} else if (
			newGroupOption === L.en.commandOptions.counterGroupSetOption.choices.description.value()
		) {
			if (!InputParseUtils.isValidString(newGroupValue, { maxLength: 300 })) {
				throw new KoboldError(
					LL.commands.counterGroup.set.interactions.stringTooLong({
						propertyName: 'description',
						numCharacters: 300,
					})
				);
			}
			targetCounterGroup.description = newGroupValue;
		} else {
			throw new KoboldError(LL.commands.counterGroup.set.interactions.invalidOptionError());
		}

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				sheet: activeCharacter.sheetRecord.sheet,
			}
		);

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			LL.commands.counterGroup.set.interactions.successEmbed.title({
				propertyName: newGroupOption,
				groupName: targetCounterGroup.name,
				newPropertyValue: newGroupValue,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
