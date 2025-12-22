import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { CounterStyleEnum, Kobold } from '@kobold/db';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import _ from 'lodash';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { CounterGroupHelpers } from '../counter-group/counter-group-helpers.js';
import { CounterHelpers } from './counter-helpers.js';
import { CounterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CounterDefinition.options;
const commandOptionsEnum = CounterDefinition.commandOptionsEnum;

export class CounterValueSubCommand extends BaseCommandClass(
	CounterDefinition,
	CounterDefinition.subCommandEnum.value
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.counterName].name) {
			const koboldUtils = new KoboldUtils(kobold);
			const autocompleteUtils = new AutocompleteUtils(koboldUtils);
			const match =
				intr.options.getString(commandOptions[commandOptionsEnum.counterName].name) ?? '';
			return autocompleteUtils.getCounters(intr, match, {
				styles: [CounterStyleEnum.default, CounterStyleEnum.dots],
			});
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
		const targetCounterName = intr.options
			.getString(commandOptions[commandOptionsEnum.counterName].name, true)
			.trim();
		const value = intr.options
			.getString(commandOptions[commandOptionsEnum.counterValue].name, true)
			.trim();

		const { counter, group } = FinderHelpers.getCounterByName(
			activeCharacter.sheetRecord.sheet,
			targetCounterName
		);
		if (!counter) {
			throw new KoboldError(
				CounterDefinition.strings.notFound({
					counterName: targetCounterName,
				})
			);
		}

		if (counter?.style === CounterStyleEnum.prepared) {
			throw new KoboldError(
				CounterDefinition.strings.notNumeric({
					counterName: targetCounterName,
				})
			);
		}

		if (!value.match(/^[+-]? *\d+$/)) {
			throw new KoboldError(
				'Yip! The value must be a number! Use + or - before the number to increase or decrease the counter.'
			);
		}
		const adjustExistingValue = value.charAt(0) === '+' || value.charAt(0) === '-';
		const valueNumber = parseInt(value);
		if (adjustExistingValue) {
			counter.current += valueNumber;
		} else {
			counter.current = valueNumber;
		}
		if (counter.current < 0) counter.current = 0;
		if (counter.max && counter.current > counter.max) counter.current = counter.max;

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				sheet: activeCharacter.sheetRecord.sheet,
			}
		);

		let updateText = '';
		if (adjustExistingValue) {
			updateText = CounterDefinition.strings.adjustValue({
				changeType: valueNumber > 0 ? 'added' : 'removed',
				toFrom: valueNumber > 0 ? 'to' : 'from',
				changeValue: Math.abs(valueNumber),
				maxMin: counter.current === counter.max ? ' the max of' : '',
				newValue: counter.current,
				counterName: counter.name,
			});
		} else {
			updateText = CounterDefinition.strings.setValue({
				counterName: counter.name,
				maxMin: counter.current === counter.max ? ' the max of' : '',
				newValue: counter.current,
			});
		}

		const embed = new KoboldEmbed().setTitle(updateText);
		if (group) {
			embed.setFields({
				name: group.name,
				value: CounterGroupHelpers.detailCounterGroup(group),
			});
		} else {
			embed.setFields({ name: counter.name, value: CounterHelpers.detailCounter(counter) });
		}

		await embed.sendBatches(intr);
	}
}
