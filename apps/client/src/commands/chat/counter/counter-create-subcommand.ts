import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';
import { Counter, CounterStyleEnum, Kobold, Sheet, isCounterStyleEnum } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';
import { CounterDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CounterDefinition.options;
const commandOptionsEnum = CounterDefinition.commandOptionsEnum;

export class CounterCreateSubCommand extends BaseCommandClass(
	CounterDefinition,
	CounterDefinition.subCommandEnum.create
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
		let name = intr.options
			.getString(commandOptions[commandOptionsEnum.counterName].name, true)
			.trim();
		let groupName =
			intr.options
				.getString(commandOptions[commandOptionsEnum.counterGroupName].name)
				?.trim() ?? null;
		let description =
			intr.options
				.getString(commandOptions[commandOptionsEnum.counterDescription].name)
				?.trim() ?? '';
		let style = intr.options
			.getString(commandOptions[commandOptionsEnum.counterStyle].name, true)
			.trim();
		let max =
			intr.options.getNumber(commandOptions[commandOptionsEnum.counterMax].name) ?? null;
		let recoverable =
			intr.options.getBoolean(commandOptions[commandOptionsEnum.counterRecoverable].name) ??
			false;
		let recoverTo = intr.options.getNumber(
			commandOptions[commandOptionsEnum.counterRecoverTo].name
		);
		const text =
			intr.options.getString(commandOptions[commandOptionsEnum.counterText].name) ?? '';
		if (!InputParseUtils.isValidString(name, { maxLength: 50 })) {
			throw new KoboldError(`Yip! The counter group name must be less than 50 characters!`);
		}
		if (!InputParseUtils.isValidString(text, { maxLength: 500 })) {
			throw new KoboldError(`Yip! The counter group text must be less than 500 characters!`);
		}
		const { counter: existingCounter } = FinderHelpers.getCounterByName(
			activeCharacter.sheetRecord.sheet,
			name
		);
		if (existingCounter) {
			throw new KoboldError(
				CounterDefinition.strings.alreadyExists({
					counterName: name,
					characterName: activeCharacter.name,
				})
			);
		}
		if (isCounterStyleEnum(style) === false) {
			throw new KoboldError(
				CounterDefinition.strings.invalidStyle({
					style: style,
				})
			);
		}
		if (!InputParseUtils.isValidString(name, { maxLength: 50 })) {
			throw new KoboldError(`Yip! The counter group name must be less than 50 characters!`);
		}
		if (name.includes('(') || name.includes(')')) {
			throw new KoboldError("Yip! The counter name can't include '(' or ')'!");
		}
		if (description && !InputParseUtils.isValidString(description, { maxLength: 300 })) {
			throw new KoboldError(
				`Yip! The counter group description must be less than 300 characters!`
			);
		}
		// default the max value
		let newCounter: Counter;
		if (style === CounterStyleEnum.prepared) {
			if (recoverTo != null) {
				throw new KoboldError(
					CounterDefinition.strings.invalidForStyle({
						parameter: 'recoverTo',
						style: 'prepared',
					})
				);
			}
			newCounter = {
				name,
				description,
				style,
				max: max ?? 2,
				prepared: Array.from({ length: max ?? 2 }, () => null),
				active: Array.from({ length: max ?? 2 }, () => true),
				recoverable,
				text,
			};
		} else if (style === CounterStyleEnum.dots) {
			if ((max ?? 0) > 20) {
				throw new KoboldError(CounterDefinition.strings.maxTooLarge);
			}
			if ((recoverTo ?? 0) < -2) {
				throw new KoboldError(CounterDefinition.strings.recoverToInvalid);
			}
			newCounter = {
				name,
				description,
				style,
				max: max ?? 20,
				current: max ?? 0,
				recoverable,
				recoverTo: recoverTo ?? -1,
				text,
			};
		} else {
			if ((recoverTo ?? 0) < -2) {
				throw new KoboldError(CounterDefinition.strings.recoverToInvalid);
			}
			// default or dots style
			newCounter = {
				name,
				description,
				style,
				max,
				current: max ?? 0,
				recoverable,
				recoverTo: (recoverTo ?? max != null) ? -1 : 0,
				text,
			};
		}
		let sheetToUpload: Sheet;
		if (groupName) {
			const targetGroup = FinderHelpers.getCounterGroupByName(
				activeCharacter.sheetRecord.sheet.counterGroups,
				groupName
			);
			if (!targetGroup) {
				throw new KoboldError(
					CounterDefinition.strings.groupNotFound({
						groupName,
					})
				);
			}
			targetGroup.counters.push(newCounter);
			sheetToUpload = activeCharacter.sheetRecord.sheet;
		} else {
			sheetToUpload = {
				...activeCharacter.sheetRecord.sheet,
				countersOutsideGroups: [
					...activeCharacter.sheetRecord.sheet.countersOutsideGroups,
					newCounter,
				],
			};
		}

		//create the counter
		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				sheet: sheetToUpload,
			}
		);

		//send a response
		await InteractionUtils.send(
			intr,
			CounterDefinition.strings.created({
				counterName: name,
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
