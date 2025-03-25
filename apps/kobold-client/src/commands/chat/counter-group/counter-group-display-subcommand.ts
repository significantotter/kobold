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
import { Kobold } from '@kobold/db';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { CounterGroupHelpers } from './counter-group-helpers.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { CounterGroupOptions } from './counter-group-command-options.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';

export class CounterGroupDisplaySubCommand implements Command {
	public name = L.en.commands.counterGroup.display.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.counterGroup.display.name(),
		description: L.en.commands.counterGroup.display.description(),
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
		if (option.name === CounterGroupOptions.COUNTER_GROUP_NAME_OPTION.name) {
			const koboldUtils = new KoboldUtils(kobold);
			const autocompleteUtils = new AutocompleteUtils(koboldUtils);
			const match =
				intr.options.getString(CounterGroupOptions.COUNTER_GROUP_NAME_OPTION.name) ?? '';
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
		const targetCounterGroupName = intr.options
			.getString(CounterGroupOptions.COUNTER_GROUP_NAME_OPTION.name, true)
			.trim();

		const counterGroup = FinderHelpers.getCounterGroupByName(
			activeCharacter.sheetRecord.sheet.counterGroups,
			targetCounterGroupName
		);

		if (!counterGroup) {
			throw new KoboldError(
				LL.commands.counterGroup.interactions.notFound({
					groupName: targetCounterGroupName,
				})
			);
		}

		const embed = await new KoboldEmbed();
		embed.setCharacter(activeCharacter);
		embed.setTitle(`${activeCharacter.name}'s Counter Groups`);
		embed.setDescription(CounterGroupHelpers.detailCounterGroup(counterGroup));
		await embed.sendBatches(intr);
	}
}
