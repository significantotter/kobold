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
import { CounterGroupHelpers } from '../counter-group/counter-group-helpers.js';
import { CounterHelpers } from './counter-helpers.js';
import { CounterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CounterDefinition.options;
const commandOptionsEnum = CounterDefinition.commandOptionsEnum;

export class CounterUseSlotSubCommand extends BaseCommandClass(
	CounterDefinition,
	CounterDefinition.subCommandEnum.useSlot
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
		if (option.name === commandOptions[commandOptionsEnum.counterSlot].name) {
			const counter = intr.options.getString(
				commandOptions[commandOptionsEnum.counterName].name
			);
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

		{ kobold }: { kobold: Kobold }
	): Promise<void> {
		const koboldUtils = new KoboldUtils(kobold);
		const { activeCharacter } = await koboldUtils.fetchNonNullableDataForCommand(intr, {
			activeCharacter: true,
		});
		const targetCounterName = intr.options
			.getString(commandOptions[commandOptionsEnum.counterName].name, true)
			.trim();
		const resetSlot = intr.options.getBoolean(
			commandOptions[commandOptionsEnum.counterResetSlot].name
		);
		const targetSlot = intr.options
			.getString(commandOptions[commandOptionsEnum.counterSlot].name, true)
			.trim();
		const [slotIndexString, ...slotValues] = targetSlot
			.replaceAll('✓', ':')
			.replaceAll('✗', ':')
			.split(': ');
		const slotValue = slotValues.join(': ');
		if (!InputParseUtils.isValidNumber(slotIndexString)) {
			throw new KoboldError("Yip! I couldn't find that slot");
		}
		const slotIndex = InputParseUtils.parseAsNumber(slotIndexString);

		const { counter, group } = FinderHelpers.getCounterByName(
			activeCharacter.sheetRecord.sheet,
			targetCounterName
		);

		if (counter?.style !== CounterStyleEnum.prepared) {
			throw new KoboldError(
				CounterDefinition.strings.notPrepared({
					counterName: targetCounterName,
				})
			);
		}
		counter.active[slotIndex] = (resetSlot ?? false) ? true : false;

		if (!counter) {
			throw new KoboldError(
				CounterDefinition.strings.notFound({
					counterName: targetCounterName,
				})
			);
		}

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				sheet: activeCharacter.sheetRecord.sheet,
			}
		);
		const embed = new KoboldEmbed().setTitle(
			CounterDefinition.strings.usedSlot({
				counterName: group ? `${group.name}: ${counter.name}` : counter.name,
				usedOrReset: resetSlot ? 'reset' : 'used',
				slotName: slotValue,
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
