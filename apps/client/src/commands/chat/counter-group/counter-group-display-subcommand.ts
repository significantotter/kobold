import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
} from 'discord.js';

import { Kobold } from '@kobold/db';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Command } from '../../index.js';
import { CounterGroupHelpers } from './counter-group-helpers.js';
import { FinderHelpers } from '../../../utils/kobold-helpers/finder-helpers.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { AutocompleteUtils } from '../../../utils/kobold-service-utils/autocomplete-utils.js';
import { CounterGroupDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
const commandOptions = CounterGroupDefinition.options;
const commandOptionsEnum = CounterGroupDefinition.commandOptionsEnum;

export class CounterGroupDisplaySubCommand extends BaseCommandClass(
	CounterGroupDefinition,
	CounterGroupDefinition.subCommandEnum.display
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
		const targetCounterGroupName = intr.options
			.getString(commandOptions[commandOptionsEnum.counterGroupName].name, true)
			.trim();

		const counterGroup = FinderHelpers.getCounterGroupByName(
			activeCharacter.sheetRecord.sheet.counterGroups,
			targetCounterGroupName
		);

		if (!counterGroup) {
			throw new KoboldError(
				CounterGroupDefinition.strings.notFound({
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
