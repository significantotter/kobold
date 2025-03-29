import {
	APIEmbed,
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	EmbedData,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { getEmoji } from '../../../constants/emoji.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { Pf2eToolsCompendiumModel } from '@kobold/pf2etools';
import { CompendiumEmbedParser } from '@kobold/pf2etools';
import { Pf2eToolsUtils } from '@kobold/pf2etools';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { CompendiumOptions } from './compendium-command-options.js';

import _ from 'lodash';
import { ActionCostEnum, DefaultCompendiumEnum, Kobold } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { StringUtils } from '@kobold/base-utils';
import { NethysDb, NethysEmoji, NethysParser } from '@kobold/nethys';
import { InteractionUtils } from '../../../utils/interaction-utils.js';

export class CompendiumSearchSubCommand implements Command {
	public name = L.en.commands.compendium.search.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.compendium.search.name(),
		description: L.en.commands.compendium.search.description(),
		dm_permission: true,
		default_member_permissions: undefined,
	};
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{
			kobold,
			pf2eToolsCompendium,
			nethysCompendium,
		}: {
			pf2eToolsCompendium: Pf2eToolsCompendiumModel;
			kobold: Kobold;
			nethysCompendium: NethysDb;
		}
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name) {
			const search =
				intr.options.getString(CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name, true) ?? '';
			const { userSettingsUtils } = await new KoboldUtils(kobold);
			const userSettings = await userSettingsUtils.getSettingsForUser(intr);
			let searchResults: { name: string; value: string }[] = [];
			if (userSettings.defaultCompendium === DefaultCompendiumEnum.pf2etools) {
				searchResults = await Pf2eToolsUtils.getSearchNameValue(
					search,
					pf2eToolsCompendium
				);
			} else {
				searchResults = (
					await nethysCompendium.searchTerm(search, {
						searchTermOnly: true,
						bestiary: false,
						randomOrder: true,
						limit: 50,
					})
				).map(result => ({ name: result.search, value: result.search }));
			}
			const closestMatchSorter = StringUtils.generateSorterByWordDistance(
				search,
				(result: { name: string; value: string }) => result.name
			);
			return searchResults.sort(closestMatchSorter).slice(0, 50);
		}
	}
	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{
			kobold,
			nethysCompendium,
			pf2eToolsCompendium,
		}: {
			kobold: Kobold;
			nethysCompendium: NethysDb;
			pf2eToolsCompendium: Pf2eToolsCompendiumModel;
		}
	): Promise<void> {
		const search = intr.options
			.getString(CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name, true)
			.trim();

		const { userSettingsUtils } = await new KoboldUtils(kobold);
		const userSettings = await userSettingsUtils.getSettingsForUser(intr);
		let result: APIEmbed | EmbedData | undefined = undefined;

		if (userSettings.defaultCompendium === DefaultCompendiumEnum.pf2etools) {
			const embedParser = new CompendiumEmbedParser(pf2eToolsCompendium, (emoji: string) =>
				getEmoji(intr, emoji)
			);
			const searchResults = await Pf2eToolsUtils.search(search, pf2eToolsCompendium, 1);
			const parsedResult = await Pf2eToolsUtils.parseSearchResult(
				searchResults,
				search,
				embedParser
			);
			if (!parsedResult) {
				throw new KoboldError(
					"Yip! I couldn't find any results for that search in the compendium."
				);
			}
			await new KoboldEmbed(parsedResult).sendBatches(intr);
		} else {
			const searchResults = await nethysCompendium.search(search, {
				limit: 50,
				searchTermOnly: false,
				bestiary: false,
			});
			const closestMatchSorter = StringUtils.generateSorterByWordDistance(
				search,
				(c: { [k: string]: any; search: string }) => c.search
			);

			const bestResult = searchResults.sort(closestMatchSorter)[0];

			let parsedMarkdownResult = await new NethysParser().parseCompendiumEntry(
				bestResult.data
			);
			parsedMarkdownResult = parsedMarkdownResult
				.replaceAll(NethysEmoji.oneAction, getEmoji(intr, ActionCostEnum.oneAction))
				.replaceAll(NethysEmoji.twoActions, getEmoji(intr, ActionCostEnum.twoActions))
				.replaceAll(NethysEmoji.threeActions, getEmoji(intr, ActionCostEnum.threeActions))
				.replaceAll(NethysEmoji.reaction, getEmoji(intr, ActionCostEnum.reaction))
				.replaceAll(NethysEmoji.freeAction, getEmoji(intr, ActionCostEnum.freeAction));

			if (!parsedMarkdownResult) {
				throw new KoboldError(
					"Yip! I couldn't find any results for that search in the compendium."
				);
			}
			const embed = new KoboldEmbed({ description: parsedMarkdownResult });

			await embed.sendBatches(intr);
		}
	}
}
