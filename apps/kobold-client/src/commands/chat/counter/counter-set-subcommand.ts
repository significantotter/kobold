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
import { RateLimiter } from 'discord.js-rate-limiter';

import _ from 'lodash';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import {
	Counter,
	CounterStyleEnum,
	DotsCounter,
	Kobold,
	NumericCounter,
	PreparedCounter,
} from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { CounterOptions } from './counter-command-options.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';
import { CounterHelpers } from './counter-helpers.js';
import { CounterGroupHelpers } from '../counter-group/counter-group-helpers.js';

export class CounterSetSubCommand implements Command {
	public names = [L.en.commands.counter.set.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.counter.set.name(),
		description: L.en.commands.counter.set.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
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
			return autocompleteUtils.getCounters(intr, match);
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
		const newCounterOption = intr.options
			.getString(CounterOptions.COUNTER_SET_OPTION_OPTION.name, true)
			.trim();
		const newCounterValue = intr.options
			.getString(CounterOptions.COUNTER_SET_VALUE_OPTION.name, true)
			.trim();

		let { counter: targetCounter, group } = FinderHelpers.getCounterByName(
			activeCharacter.sheetRecord.sheet,
			targetCounterName
		);
		if (!targetCounter) {
			throw new KoboldError(
				LL.commands.counter.interactions.notFound({
					counterName: targetCounterName,
				})
			);
		}

		if (newCounterOption === L.en.commandOptions.counterSetOption.choices.name.value()) {
			const { counter } = FinderHelpers.getCounterByName(
				activeCharacter.sheetRecord.sheet,
				newCounterValue
			);
			if (counter) {
				throw new KoboldError(
					LL.commands.counter.create.interactions.alreadyExists({
						counterName: newCounterValue,
						characterName: activeCharacter.name,
					})
				);
			}

			if (!InputParseUtils.isValidString(newCounterValue, { maxLength: 50 })) {
				throw new KoboldError(
					LL.commands.counter.set.interactions.stringTooLong({
						propertyName: 'name',
						numCharacters: 50,
					})
				);
			}
			targetCounter.name = newCounterValue;
		} else if (
			newCounterOption === L.en.commandOptions.counterSetOption.choices.description.value()
		) {
			if (!InputParseUtils.isValidString(newCounterValue, { maxLength: 300 })) {
				throw new KoboldError(
					LL.commands.counter.set.interactions.stringTooLong({
						propertyName: 'description',
						numCharacters: 300,
					})
				);
			}
			targetCounter.description = newCounterValue;
		} else if (newCounterOption === L.en.commandOptions.counterSetOption.choices.text.value()) {
			if (!InputParseUtils.isValidString(newCounterValue, { maxLength: 500 })) {
				throw new KoboldError(
					LL.commands.counter.set.interactions.stringTooLong({
						propertyName: 'text',
						numCharacters: 500,
					})
				);
			}
			targetCounter.text = newCounterValue;
		} else if (newCounterOption === L.en.commandOptions.counterSetOption.choices.max.value()) {
			const totalMax =
				targetCounter.style === 'prepared' || targetCounter.style === 'dots'
					? 20
					: Infinity;
			const newMax = Math.trunc(InputParseUtils.parseAsNullableNumber(newCounterValue) ?? -1);
			if (newMax > totalMax || (newMax === -1 && targetCounter.style !== 'default')) {
				throw new KoboldError(LL.commands.counter.interactions.maxTooLarge());
			}
			if (newMax < -1) {
				throw new KoboldError(LL.commands.counter.interactions.maxTooSmall());
			}
			targetCounter.max = newMax === -1 ? Infinity : newMax;

			if (targetCounter.style === CounterStyleEnum.prepared) {
				targetCounter.active = targetCounter.active.slice(0, newMax);
				targetCounter.prepared = targetCounter.prepared.slice(0, newMax);
				while (targetCounter.active.length < newMax) {
					targetCounter.active.push(true);
				}
				while (targetCounter.prepared.length < newMax) {
					targetCounter.prepared.push(null);
				}
			}
		} else if (
			newCounterOption === L.en.commandOptions.counterSetOption.choices.recoverTo.value()
		) {
			const newResetTo = Math.trunc(
				InputParseUtils.parseAsNullableNumber(newCounterValue) ?? -1
			);
			if (targetCounter.style === 'prepared') {
				throw new KoboldError(
					LL.commands.counter.interactions.invalidForStyle({
						parameter: L.en.commandOptions.counterSetOption.choices.recoverTo.value(),
						style: targetCounter.style,
					})
				);
			}
			if (newResetTo < -2) {
				throw new KoboldError(LL.commands.counter.interactions.recoverToInvalid());
			}
			targetCounter.recoverTo = newResetTo;
		} else if (
			newCounterOption === L.en.commandOptions.counterSetOption.choices.recoverable.value()
		) {
			const newRecoverable = InputParseUtils.parseAsBoolean(newCounterValue);
			targetCounter.recoverable = newRecoverable;
		} else if (
			newCounterOption === L.en.commandOptions.counterSetOption.choices.style.value()
		) {
			//numeric
			if (
				targetCounter.style === CounterStyleEnum.default ||
				targetCounter.style === CounterStyleEnum.dots
			) {
				if (newCounterValue === CounterStyleEnum.dots) {
					targetCounter.style = CounterStyleEnum.dots;
					targetCounter.max = Math.max(targetCounter.max ?? 20, 20);
					targetCounter.current = Math.min(targetCounter.current ?? 0, 20);
				} else if (newCounterValue === CounterStyleEnum.default) {
					targetCounter.style = CounterStyleEnum.default;
				} else {
					(targetCounter as Counter as PreparedCounter).style = CounterStyleEnum.prepared;
					(targetCounter as Counter as PreparedCounter).active = [];
					(targetCounter as Counter as PreparedCounter).prepared = [];
					delete (targetCounter as any).current;
				}
			} else {
				if (newCounterValue === CounterStyleEnum.dots) {
					(targetCounter as Counter as DotsCounter).style = CounterStyleEnum.dots;
					(targetCounter as Counter as DotsCounter).current =
						targetCounter.prepared.length;
					(targetCounter as Counter as DotsCounter).recoverTo = -1;
					(targetCounter as Counter as DotsCounter).max = Math.max(
						targetCounter.max ?? 20,
						20
					);
					delete (targetCounter as any).prepared;
					delete (targetCounter as any).active;
				} else if (newCounterValue === CounterStyleEnum.default) {
					(targetCounter as Counter as NumericCounter).style = CounterStyleEnum.default;
					(targetCounter as Counter as NumericCounter).current =
						targetCounter.prepared.length;
					(targetCounter as Counter as NumericCounter).recoverTo = -1;

					delete (targetCounter as any).prepared;
					delete (targetCounter as any).active;
				}
				// otherwise no change with prepared -> prepared
			}
		} else {
			throw new KoboldError(LL.commands.counter.set.interactions.invalidOptionError());
		}

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				sheet: activeCharacter.sheetRecord.sheet,
			}
		);

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			LL.commands.counter.set.interactions.successEmbed.title({
				propertyName: newCounterOption,
				groupName: targetCounter.name,
				newPropertyValue: newCounterValue,
			})
		);
		if (group) {
			updateEmbed.setFields({
				name: group.name,
				value: CounterGroupHelpers.detailCounterGroup(group),
			});
		} else {
			updateEmbed.setFields({
				name: targetCounter.name,
				value: CounterHelpers.detailCounter(targetCounter),
			});
		}
		await InteractionUtils.send(intr, updateEmbed);
	}
}
