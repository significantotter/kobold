import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CounterStyleEnum, Kobold } from '@kobold/db';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { CounterOptions } from './counter-command-options.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import _ from 'lodash';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { CounterHelpers } from './counter-helpers.js';
import { CounterGroupHelpers } from '../counter-group/counter-group-helpers.js';
import { CounterCommand } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';

export class CounterPrepareSubCommand extends BaseCommandClass(
	CounterCommand,
	CounterCommand.subCommandEnum.prepare
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{ kobold }: { kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === CounterOptions.COUNTER_NAME_OPTION.name) {
			const koboldUtils = new KoboldUtils(kobold);
			const autocompleteUtils = new AutocompleteUtils(koboldUtils);
			const match = intr.options.getString(CounterOptions.COUNTER_NAME_OPTION.name) ?? '';
			return autocompleteUtils.getCounters(intr, match, {
				styles: [CounterStyleEnum.prepared],
			});
		}
		if (option.name === CounterOptions.COUNTER_SLOT_OPTION.name) {
			const counter = intr.options.getString(CounterOptions.COUNTER_NAME_OPTION.name);
			if (!counter) return;
			const koboldUtils = new KoboldUtils(kobold);
			const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
				activeCharacter: true,
			});
			const { counter: counterData } = FinderHelpers.getCounterByName(
				activeCharacter.sheetRecord.sheet,
				counter
			);
			if (!counterData || counterData.style !== CounterStyleEnum.prepared) return;
			return counterData.prepared.map((slot, index) => ({
				name: `${index} ${counterData.active[index] ? '✓' : '✗'} ${slot ?? '(empty)'}`,
				value: `${index} ${counterData.active[index] ? '✓' : '✗'} ${slot ?? '(empty)'}`,
			}));
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
		const targetCounterName = intr.options
			.getString(CounterOptions.COUNTER_NAME_OPTION.name, true)
			.trim();
		const targetSlot = intr.options
			.getString(CounterOptions.COUNTER_SLOT_OPTION.name, true)
			.trim();
		const newAbility = intr.options
			.getString(CounterOptions.COUNTER_PREPARE_SLOT_OPTION.name, true)
			.trim();
		const [slotIndexString] = targetSlot.replaceAll('✓', ':').replaceAll('✗', ':').split(': ');

		const { counter, group } = FinderHelpers.getCounterByName(
			activeCharacter.sheetRecord.sheet,
			targetCounterName
		);

		if (!InputParseUtils.isValidString(newAbility, { maxLength: 50 })) {
			throw new KoboldError(`Yip! The prepared ability must be less than 50 characters!`);
		}

		if (!counter) {
			throw new KoboldError(
				LL.commands.counter.interactions.notFound({
					counterName: targetCounterName,
				})
			);
		}

		if (counter.style !== CounterStyleEnum.prepared) {
			throw new KoboldError(
				LL.commands.counter.interactions.notPrepared({
					counterName: targetCounterName,
				})
			);
		}

		if (counter.active.length <= Number(slotIndexString)) {
			throw new KoboldError("Yip! I couldn't find that slot!");
		}

		counter.prepared[Number(slotIndexString)] = newAbility;

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				sheet: activeCharacter.sheetRecord.sheet,
			}
		);
		const embed = new KoboldEmbed().setTitle(
			LL.commands.counter.prepare.interactions.prepared({
				counterName: counter.name,
				slotName: newAbility,
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
		await embed.sendBatches(intr);
	}
}
