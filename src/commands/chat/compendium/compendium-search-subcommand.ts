import {
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
} from 'discord.js';
import { Command, CommandDeferType } from '../../index.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CompendiumModel } from '../../../services/pf2etools/compendium.model.js';
import { CompendiumOptions } from './compendium-command-options.js';
import { CompendiumEmbedParser } from '../../../services/pf2etools/parser/compendium-parser.js';
import { getEmoji } from '../../../constants/emoji.js';
import { AutocompleteUtils } from '../../../utils/autocomplete-utils.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { CompendiumUtils } from '../../../services/pf2etools/utils/compendium-utils.js';
import { Ability, Action, Affliction, Creature } from '../../../services/pf2etools/models/index.js';
import { DrizzleUtils } from '../../../services/pf2etools/utils/drizzle-utils.js';
import { KoboldError } from '../../../utils/KoboldError.js';
import { StringUtils } from '../../../utils/string-utils.js';
import _ from 'lodash';

export class CompendiumSearchSubCommand implements Command {
	public names = [L.en.commands.compendium.search.name()];
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
		{ compendium }: { compendium: CompendiumModel }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name) {
			const search =
				intr.options.getString(CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name, true) ?? '';
			return AutocompleteUtils.searchCompendium(intr, search, compendium);
		}
	}
	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		data: any,
		{ compendium }: { compendium: CompendiumModel }
	): Promise<void> {
		const search = intr.options
			.getString(CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name, true)
			.trim();

		const embedParser = new CompendiumEmbedParser(compendium, (emoji: string) =>
			getEmoji(intr, emoji)
		);

		let result: KoboldEmbed | undefined = undefined;

		const searchResults = await CompendiumUtils.search(search, compendium, 1);
		const closestMatchSorter = StringUtils.generateSorterByWordDistance(
			search,
			(c: { [k: string]: any; search: string }) => c.search
		);
		const bestResult = Object.entries(searchResults)
			.map(([model, value]): { model: string; search: string } | null =>
				value?.[0]
					? {
							model,
							search: value[0].search,
					  }
					: null
			)
			.filter(_.identity)
			.sort(closestMatchSorter)[0];

		switch (bestResult?.model) {
			case 'abilities':
				result = await embedParser.parseAbility(searchResults.abilities[0].data as Ability);
				break;
			case 'actions':
				result = await embedParser.parseAction(searchResults.actions[0].data as Action);
				break;
			case 'afflictions':
				result = await embedParser.parseAffliction(
					searchResults.afflictions[0].data as Affliction
				);
				break;
			case 'ancestries':
				break;
			case 'archetypes':
				break;
			case 'backgrounds':
				break;
			case 'books':
				break;
			case 'classes':
				break;
			case 'classFeatures':
				break;
			case 'companionAbilities':
				break;
			case 'companions':
				break;
			case 'conditions':
				break;
			case 'creatures':
				result = await embedParser.parseCreature(
					searchResults.creatures[0].data as Creature
				);
				break;
			case 'creaturesFluff':
				break;
			case 'creatureTemplates':
				break;
			case 'creatureTemplatesFluff':
				break;
			case 'deities':
				break;
			case 'deitiesFluff':
				break;
			case 'domains':
				break;
			case 'eidolons':
				break;
			case 'events':
				break;
			case 'familiarAbilities':
				break;
			case 'familiars':
				break;
			case 'feats':
				break;
			case 'groups':
				break;
			case 'hazards':
				break;
			case 'items':
				break;
			case 'languages':
				break;
			case 'optionalFeatures':
				break;
			case 'organizations':
				break;
			case 'organizationsFluff':
				break;
			case 'places':
				break;
			case 'quickRules':
				break;
			case 'rituals':
				break;
			case 'skills':
				break;
			case 'spells':
				break;
			case 'tables':
				break;
			case 'traits':
				break;
			case 'variantRules':
				break;
			case 'vehicles':
				break;
		}

		if (!result) {
			throw new KoboldError(
				"Yip! I couldn't find any results for that search in the compendium."
			);
		}

		await result.sendBatches(intr);
	}
}
