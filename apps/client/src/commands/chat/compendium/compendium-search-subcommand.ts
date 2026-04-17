import {
	APIEmbed,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	EmbedData,
} from 'discord.js';
import { getEmoji } from '../../../constants/emoji.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Command } from '../../index.js';

import _ from 'lodash';
import { ActionCostEnum, GameSystemEnum, Kobold, isGameSystemEnum } from '@kobold/db';
import { KoboldError } from '../../../utils/KoboldError.js';
import { StringUtils } from '@kobold/base-utils';
import { NethysDb, NethysEmoji, NethysParser } from '@kobold/nethys';
import { CompendiumDefinition } from '@kobold/documentation';
import { BaseCommandClass } from '../../command.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { Config } from '@kobold/config';
const commandOptions = CompendiumDefinition.options;
const commandOptionsEnum = CompendiumDefinition.commandOptionsEnum;

export class CompendiumSearchSubCommand extends BaseCommandClass(
	CompendiumDefinition,
	CompendiumDefinition.subCommandEnum.search
) {
	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption,
		{
			kobold,
			nethysCompendium,
		}: {
			kobold: Kobold;
			nethysCompendium: NethysDb;
		}
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === commandOptions[commandOptionsEnum.search].name) {
			const search =
				intr.options.getString(commandOptions[commandOptionsEnum.search].name, true) ?? '';
			const gameSystemOverride = intr.options.getString(
				commandOptions[commandOptionsEnum.gameSystem].name
			);
			const koboldUtils = new KoboldUtils(kobold);
			const userSettings = await koboldUtils.userSettingsUtils.getSettingsForUser(intr);
			const gameSystem =
				(isGameSystemEnum(gameSystemOverride) ? gameSystemOverride : null) ??
				userSettings.gameSystem ??
				GameSystemEnum.pf2e;
			let searchResults: { name: string; value: string }[] = [];

			searchResults = (
				await nethysCompendium.searchTerm(search, {
					searchTermOnly: true,
					bestiary: false,
					randomOrder: true,
					limit: 50,
					gameSystem,
				})
			).map(result => ({ name: result.search, value: result.search }));

			const closestMatchSorter = StringUtils.generateSorterByWordDistance(
				search,
				(result: { name: string; value: string }) => result.name
			);
			return searchResults.sort(closestMatchSorter).slice(0, 50);
		}
	}
	public async execute(
		intr: ChatInputCommandInteraction,
		{
			kobold,
			nethysCompendium,
		}: {
			kobold: Kobold;
			nethysCompendium: NethysDb;
		}
	): Promise<void> {
		const search = intr.options
			.getString(commandOptions[commandOptionsEnum.search].name, true)
			.trim();

		const koboldUtils = new KoboldUtils(kobold);
		const userSettings = await koboldUtils.userSettingsUtils.getSettingsForUser(intr);
		const gameSystemOverride = intr.options.getString(
			commandOptions[commandOptionsEnum.gameSystem].name
		);
		const gameSystem =
			(isGameSystemEnum(gameSystemOverride) ? gameSystemOverride : null) ??
			userSettings.gameSystem ??
			GameSystemEnum.pf2e;
		const baseUrl =
			gameSystem === GameSystemEnum.sf2e ? Config.nethys.sf2eBaseUrl : Config.nethys.baseUrl;

		let result: APIEmbed | EmbedData | undefined = undefined;

		const searchResults = await nethysCompendium.search(search, {
			limit: 50,
			searchTermOnly: false,
			bestiary: false,
			gameSystem,
		});
		const closestMatchSorter = StringUtils.generateSorterByWordDistance(
			search,
			(c: { [k: string]: any; search: string }) => c.search
		);

		const bestResult = searchResults.sort(closestMatchSorter)[0];

		if (!bestResult) {
			throw new KoboldError(
				"Yip! I couldn't find any results for that search in the compendium."
			);
		}

		let parsedMarkdownResult = await new NethysParser().parseCompendiumEntry(
			bestResult.data,
			baseUrl
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
