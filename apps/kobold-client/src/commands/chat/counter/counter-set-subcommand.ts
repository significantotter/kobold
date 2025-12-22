import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import _ from 'lodash';

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
import { Command } from '../../index.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';
import { CounterHelpers } from './counter-helpers.js';
import { CounterGroupHelpers } from '../counter-group/counter-group-helpers.js';
import { CounterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CounterDefinition.options;
const commandOptionsEnum = CounterDefinition.commandOptionsEnum;

export class CounterSetSubCommand extends BaseCommandClass(
	CounterDefinition,
	CounterDefinition.subCommandEnum.set
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
		const newCounterOption = intr.options
			.getString(commandOptions[commandOptionsEnum.counterSetOption].name, true)
			.trim();
		const newCounterValue = intr.options
			.getString(commandOptions[commandOptionsEnum.counterSetValue].name, true)
			.trim();

		let { counter: targetCounter, group } = FinderHelpers.getCounterByName(
			activeCharacter.sheetRecord.sheet,
			targetCounterName
		);
		if (!targetCounter) {
			throw new KoboldError(
				CounterDefinition.strings.notFound({
					counterName: targetCounterName,
				})
			);
		}

		if (newCounterOption === CounterDefinition.optionChoices.setOption.name) {
			const { counter } = FinderHelpers.getCounterByName(
				activeCharacter.sheetRecord.sheet,
				newCounterValue
			);
			if (counter) {
				throw new KoboldError(
					CounterDefinition.strings.alreadyExists({
						counterName: newCounterValue,
						characterName: activeCharacter.name,
					})
				);
			}

			if (!InputParseUtils.isValidString(newCounterValue, { maxLength: 50 })) {
				throw new KoboldError(
					CounterDefinition.strings.setStringTooLong({
						propertyName: 'name',
						numCharacters: 50,
					})
				);
			}
			targetCounter.name = newCounterValue;
		} else if (newCounterOption === CounterDefinition.optionChoices.setOption.description) {
			if (!InputParseUtils.isValidString(newCounterValue, { maxLength: 300 })) {
				throw new KoboldError(
					CounterDefinition.strings.setStringTooLong({
						propertyName: 'description',
						numCharacters: 300,
					})
				);
			}
			targetCounter.description = newCounterValue;
		} else if (newCounterOption === CounterDefinition.optionChoices.setOption.text) {
			if (!InputParseUtils.isValidString(newCounterValue, { maxLength: 500 })) {
				throw new KoboldError(
					CounterDefinition.strings.setStringTooLong({
						propertyName: 'text',
						numCharacters: 500,
					})
				);
			}
			targetCounter.text = newCounterValue;
		} else if (newCounterOption === CounterDefinition.optionChoices.setOption.max) {
			const totalMax =
				targetCounter.style === 'prepared' || targetCounter.style === 'dots'
					? 20
					: Infinity;
			const newMax = Math.trunc(InputParseUtils.parseAsNullableNumber(newCounterValue) ?? -1);
			if (newMax > totalMax || (newMax === -1 && targetCounter.style !== 'default')) {
				throw new KoboldError(CounterDefinition.strings.maxTooLarge);
			}
			if (newMax < -1) {
				throw new KoboldError(CounterDefinition.strings.maxTooSmall);
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
		} else if (newCounterOption === CounterDefinition.optionChoices.setOption.recoverTo) {
			const newResetTo = Math.trunc(
				InputParseUtils.parseAsNullableNumber(newCounterValue) ?? -1
			);
			if (targetCounter.style === 'prepared') {
				throw new KoboldError(
					CounterDefinition.strings.invalidForStyle({
						parameter: CounterDefinition.optionChoices.setOption.recoverTo,
						style: targetCounter.style,
					})
				);
			}
			if (newResetTo < -2) {
				throw new KoboldError(CounterDefinition.strings.recoverToInvalid);
			}
			targetCounter.recoverTo = newResetTo;
		} else if (newCounterOption === CounterDefinition.optionChoices.setOption.recoverable) {
			const newRecoverable = InputParseUtils.parseAsBoolean(newCounterValue);
			targetCounter.recoverable = newRecoverable;
		} else if (newCounterOption === CounterDefinition.optionChoices.setOption.style) {
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
			throw new KoboldError(CounterDefinition.strings.setInvalidOption);
		}

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				sheet: activeCharacter.sheetRecord.sheet,
			}
		);

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			CounterDefinition.strings.setSuccess.title({
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
