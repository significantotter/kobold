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
import { Kobold } from '@kobold/db';
import { InteractionUtils } from '../../../utils/index.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { CounterGroupOptions } from './counter-group-command-options.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { InputParseUtils } from '../../../utils/input-parse-utils.js';

export class CounterGroupSetSubCommand implements Command {
	public name = L.en.commands.counterGroup.set.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.counterGroup.set.name(),
		description: L.en.commands.counterGroup.set.description(),
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
		const targetCounterGroupName = intr.options.getString(
			CounterGroupOptions.COUNTER_GROUP_NAME_OPTION.name,
			true
		);
		const newGroupOption = intr.options.getString(
			CounterGroupOptions.COUNTER_GROUP_SET_OPTION_OPTION.name,
			true
		);
		const newGroupValue = intr.options.getString(
			CounterGroupOptions.COUNTER_GROUP_SET_VALUE_OPTION.name,
			true
		);

		const targetCounterGroup = FinderHelpers.getCounterGroupByName(
			activeCharacter.sheetRecord.sheet.counterGroups,
			targetCounterGroupName
		);
		if (!targetCounterGroup) {
			throw new KoboldError(
				LL.commands.counterGroup.interactions.notFound({
					groupName: targetCounterGroupName,
				})
			);
		}

		if (newGroupOption === L.en.commandOptions.counterGroupSetOption.choices.name.value()) {
			if (!InputParseUtils.isValidString(newGroupValue, { maxLength: 50 })) {
				throw new KoboldError(
					LL.commands.counterGroup.set.interactions.stringTooLong({
						propertyName: 'name',
						numCharacters: 50,
					})
				);
			}
			targetCounterGroup.name = newGroupValue;
		} else if (
			newGroupOption === L.en.commandOptions.counterGroupSetOption.choices.description.value()
		) {
			if (!InputParseUtils.isValidString(newGroupValue, { maxLength: 300 })) {
				throw new KoboldError(
					LL.commands.counterGroup.set.interactions.stringTooLong({
						propertyName: 'description',
						numCharacters: 300,
					})
				);
			}
			targetCounterGroup.description = newGroupValue;
		} else {
			throw new KoboldError(LL.commands.counterGroup.set.interactions.invalidOptionError());
		}

		await kobold.sheetRecord.update(
			{ id: activeCharacter.sheetRecord.id },
			{
				sheet: activeCharacter.sheetRecord.sheet,
			}
		);

		const updateEmbed = new KoboldEmbed();
		updateEmbed.setTitle(
			LL.commands.counterGroup.set.interactions.successEmbed.title({
				propertyName: newGroupOption,
				groupName: targetCounterGroup.name,
				newPropertyValue: newGroupValue,
			})
		);

		await InteractionUtils.send(intr, updateEmbed);
	}
}
