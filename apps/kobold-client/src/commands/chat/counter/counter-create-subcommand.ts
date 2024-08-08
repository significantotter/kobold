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
import { CounterOptions } from './counter-command-options.js';

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Counter, CounterStyleEnum, Kobold, Sheet, isCounterStyleEnum } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';

export class CounterCreateSubCommand implements Command {
	public names = [L.en.commands.counter.create.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.counter.create.name(),
		description: L.en.commands.counter.create.description(),
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
		if (option.name === CounterOptions.COUNTER_GROUP_NAME_OPTION.name) {
			const koboldUtils = new KoboldUtils(kobold);
			const autocompleteUtils = new AutocompleteUtils(koboldUtils);
			const match =
				intr.options.getString(CounterOptions.COUNTER_GROUP_NAME_OPTION.name) ?? '';
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
		let name = intr.options.getString(CounterOptions.COUNTER_NAME_OPTION.name, true).trim();
		let groupName =
			intr.options.getString(CounterOptions.COUNTER_GROUP_NAME_OPTION.name)?.trim() ?? null;
		let description =
			intr.options.getString(CounterOptions.COUNTER_DESCRIPTION_OPTION.name)?.trim() ?? '';
		let style = intr.options.getString(CounterOptions.COUNTER_STYLE_OPTION.name, true).trim();
		let max = intr.options.getNumber(CounterOptions.COUNTER_MAX_OPTION.name) ?? null;
		let recoverable =
			intr.options.getBoolean(CounterOptions.COUNTER_RECOVERABLE_OPTION.name) ?? false;
		let recoverTo = intr.options.getNumber(CounterOptions.COUNTER_RECOVER_TO_OPTION.name);
		const text = intr.options.getString(CounterOptions.COUNTER_TEXT_OPTION.name) ?? '';

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
				LL.commands.counter.create.interactions.alreadyExists({
					counterName: name,
					characterName: activeCharacter.name,
				})
			);
		}
		if (isCounterStyleEnum(style) === false) {
			throw new KoboldError(
				LL.commands.counter.interactions.invalidStyle({
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
					LL.commands.counter.interactions.invalidForStyle({
						parameter: L.en.commandOptions.counterSetOption.choices.recoverTo.value(),
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
				throw new KoboldError(LL.commands.counter.interactions.maxTooLarge());
			}
			if ((recoverTo ?? 0) < -2) {
				throw new KoboldError(LL.commands.counter.interactions.recoverToInvalid());
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
				throw new KoboldError(LL.commands.counter.interactions.recoverToInvalid());
			}
			// default or dots style
			newCounter = {
				name,
				description,
				style,
				max,
				current: max ?? 0,
				recoverable,
				recoverTo: recoverTo ?? max != null ? -1 : 0,
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
					LL.commands.counterGroup.interactions.notFound({
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
			LL.commands.counter.create.interactions.created({
				counterName: name,
				characterName: activeCharacter.name,
			})
		);
		return;
	}
}
