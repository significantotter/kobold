import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Kobold } from '@kobold/db';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { CounterGroupHelpers } from '../counter-group/counter-group-helpers.js';
import { CounterHelpers } from './counter-helpers.js';
import { CounterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CounterDefinition.options;
const commandOptionsEnum = CounterDefinition.commandOptionsEnum;

export class CounterResetSubCommand extends BaseCommandClass(
	CounterDefinition,
	CounterDefinition.subCommandEnum.reset
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
			return autocompleteUtils.getCounters(intr, match);
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

		if (counter.style === 'prepared') {
			counter.active = counter.prepared.map(() => true);
		} else {
			if (counter.recoverTo === -1) {
				counter.current = counter.max ?? 0;
			} else if (counter.recoverTo === -2) {
				counter.current = Math.floor((counter.max ?? 0) / 2);
			} else {
				counter.current = counter.recoverTo ?? counter.current;
			}
			counter.current =
				counter.recoverTo === -1
					? (counter.max ?? 0)
					: (counter.recoverTo ?? counter.current);
		}

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				sheet: activeCharacter.sheetRecord.sheet,
			}
		);

		const embed = new KoboldEmbed().setTitle(
			CounterDefinition.strings.reset({
				counterName: counter.name,
				characterName: activeCharacter.name,
			})
		);
		if (group) {
			embed.setFields({
				name: group.name,
				value: CounterGroupHelpers.detailCounterGroup(group),
			});
		} else {
			embed.setFields({ name: counter.name, value: CounterHelpers.detailCounter(counter) });
		}

		embed.sendBatches(intr);
	}
}
