import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CounterStyleEnum, Kobold } from '@kobold/db';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { CounterOptions } from './counter-command-options.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InteractionUtils } from '../../../utils/interaction-utils.js';
import _ from 'lodash';
import { index } from 'drizzle-orm/mysql-core';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { CounterGroupHelpers } from '../counter-group/counter-group-helpers.js';
import { CounterHelpers } from './counter-helpers.js';

export class CounterUseSlotSubCommand implements Command {
	public names = [L.en.commands.counter.useSlot.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.counter.useSlot.name(),
		description: L.en.commands.counter.useSlot.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.NONE;
	public requireClientPerms: PermissionsString[] = [];

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
		const resetSlot = intr.options.getBoolean(CounterOptions.COUNTER_RESET_SLOT_OPTION.name);
		const targetSlot = intr.options
			.getString(CounterOptions.COUNTER_SLOT_OPTION.name, true)
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
				LL.commands.counter.interactions.notPrepared({
					counterName: targetCounterName,
				})
			);
		}
		counter.active[slotIndex] = resetSlot ?? false ? true : false;

		if (!counter) {
			throw new KoboldError(
				LL.commands.counter.interactions.notFound({
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
			LL.commands.counter.useSlot.interactions.usedSlot({
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
