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
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { CounterHelpers } from './counter-helpers.js';
import { CounterGroupHelpers } from '../counter-group/counter-group-helpers.js';
import { CounterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CounterDefinition.options;
const commandOptionsEnum = CounterDefinition.commandOptionsEnum;

export class CounterPrepareManySubCommand extends BaseCommandClass(
	CounterDefinition,
	CounterDefinition.subCommandEnum.prepareMany
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
				styles: [CounterStyleEnum.prepared],
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
		const prepareFresh = intr.options.getBoolean(
			commandOptions[commandOptionsEnum.counterPrepareFresh].name,
			true
		);
		const targetSlot = intr.options
			.getString(commandOptions[commandOptionsEnum.counterPrepareMany].name, true)
			.trim();
		const preparedValues = targetSlot.split(',');
		for (const value of preparedValues) {
			if (!InputParseUtils.isValidString(value, { maxLength: 50 })) {
				throw new KoboldError(
					`Yip! Each prepared ability must be less than 50 characters!`
				);
			}
		}

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

		if (counter.style !== CounterStyleEnum.prepared) {
			throw new KoboldError(
				CounterDefinition.strings.notPrepared({
					counterName: targetCounterName,
				})
			);
		}

		if (prepareFresh) {
			counter.prepared = counter.prepared.map(() => null);
			counter.active = counter.active.map(() => true);
		}
		// if the number of null slots is less than the number of prepared values, throw an error
		if (counter.prepared.filter(slot => slot === null).length < preparedValues.length) {
			throw new KoboldError(
				'Yip! You tried to prepare more abilities than the counter has slots for!'
			);
		}

		for (let i = 0; i < counter.prepared.length; i++) {
			if (preparedValues.length === 0) break;

			if (counter.prepared[i] === null) {
				counter.prepared[i] = preparedValues.shift()!;
			}
		}

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				sheet: activeCharacter.sheetRecord.sheet,
			}
		);

		const embed = await new KoboldEmbed();
		embed.setCharacter(activeCharacter);
		embed.setTitle(`Yip! Prepared values to ${counter.name}`);
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
