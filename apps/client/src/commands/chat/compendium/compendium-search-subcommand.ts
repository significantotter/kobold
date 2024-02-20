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
import { CompendiumModel } from 'pf2etools-data';
import { CompendiumEmbedParser } from 'pf2etools-data';
import { CompendiumUtils } from 'pf2etools-data';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Command, CommandDeferType } from '../../index.js';
import { CompendiumOptions } from './compendium-command-options.js';

import _ from 'lodash';
import { Kobold } from 'kobold-db';
import type {
	Ability,
	Action,
	Affliction,
	Ancestry,
	Archetype,
	Background,
	Class,
	ClassFeature,
	Companion,
	CompanionAbility,
	Condition,
	Creature,
	CreatureTemplate,
	Deity,
	Domain,
	Eidolon,
	Event as EventType,
	Familiar,
	FamiliarAbility,
	Feat,
	Group,
	Hazard,
	Item,
	Language,
	OptionalFeature,
	Organization,
	Place,
	QuickRule,
	RelicGift,
	Ritual,
	Skill,
	Spell,
	Table,
	Trait,
	VariantRule,
	Vehicle,
	VersatileHeritage,
} from 'pf2etools-data';
import { KoboldError } from '../../../utils/KoboldError.js';
import { KoboldUtils } from '../../../utils/kobold-service-utils/kobold-utils.js';
import { StringUtils } from '../../../utils/string-utils.js';

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
		{ compendium, kobold }: { compendium: CompendiumModel; kobold: Kobold }
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;
		if (option.name === CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name) {
			const search =
				intr.options.getString(CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name, true) ?? '';
			const { autocompleteUtils } = new KoboldUtils(kobold);
			return autocompleteUtils.searchCompendium(intr, search, compendium);
		}
	}
	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
		{ compendium }: { compendium: CompendiumModel }
	): Promise<void> {
		// const renderDemo = await compendium.db.query.RenderDemos.findFirst();
		// const renderDemoData = renderDemo?.data as RenderDemo;
		// const embedParserDemo = new CompendiumEmbedParser(compendium, (emoji: string) =>
		// 	getEmoji(intr, emoji)
		// );
		// const renderDemoEmbed = await embedParserDemo.parseRenderDemo(renderDemoData);
		// await new KoboldEmbed(renderDemoEmbed).sendBatches(intr);
		// return;

		const search = intr.options
			.getString(CompendiumOptions.COMPENDIUM_SEARCH_OPTION.name, true)
			.trim();

		const embedParser = new CompendiumEmbedParser(compendium, (emoji: string) =>
			getEmoji(intr, emoji)
		);

		let result: APIEmbed | EmbedData | undefined = undefined;

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
				result = await embedParser.parseAncestry(
					searchResults.ancestries[0].data as Ancestry
				);
				break;
			case 'versatileHeritages':
				result = await embedParser.parseVersatileHeritage(
					searchResults.versatileHeritages[0].data as VersatileHeritage
				);
				break;
			case 'archetypes':
				result = await embedParser.parseArchetype(
					searchResults.archetypes[0].data as Archetype
				);
				break;
			case 'backgrounds':
				result = await embedParser.parseBackground(
					searchResults.backgrounds[0].data as Background
				);
				break;
			case 'classes':
				result = await embedParser.parseClass(searchResults.classes[0].data as Class);
				break;
			case 'classFeatures':
				result = await embedParser.parseClassFeature(
					searchResults.classFeatures[0].data as ClassFeature
				);
				break;
			case 'companionAbilities':
				result = await embedParser.parseCompanionAbility(
					searchResults.companionAbilities[0].data as CompanionAbility
				);
				break;
			case 'companions':
				result = await embedParser.parseCompanion(
					searchResults.companions[0].data as Companion
				);
				break;
			case 'conditions':
				result = await embedParser.parseCondition(
					searchResults.conditions[0].data as Condition
				);
				break;
			case 'creatures':
				result = await embedParser.parseCreature(
					searchResults.creatures[0].data as Creature
				);
				break;
			case 'creatureTemplates':
				result = await embedParser.parseCreatureTemplate(
					searchResults.creatureTemplates[0].data as CreatureTemplate
				);
				break;
			case 'deities':
				result = await embedParser.parseDeity(searchResults.deities[0].data as Deity);
				break;
			case 'domains':
				result = await embedParser.parseDomain(searchResults.domains[0].data as Domain);
				break;
			case 'eidolons':
				result = await embedParser.parseEidolon(searchResults.eidolons[0].data as Eidolon);
				break;
			case 'events':
				result = await embedParser.parseEvent(searchResults.events[0].data as EventType);
				break;
			case 'familiarAbilities':
				result = await embedParser.parseFamiliarAbility(
					searchResults.familiarAbilities[0].data as FamiliarAbility
				);
				break;
			case 'familiars':
				result = await embedParser.parseFamiliar(
					searchResults.familiars[0].data as Familiar
				);
				break;
			case 'feats':
				result = await embedParser.parseFeat(searchResults.feats[0].data as Feat);
				break;
			case 'groups':
				result = await embedParser.parseGroup(searchResults.groups[0].data as Group);
				break;
			case 'hazards':
				result = await embedParser.parseHazard(searchResults.hazards[0].data as Hazard);
				break;
			case 'items':
				result = await embedParser.parseItem(searchResults.items[0].data as Item);
				break;
			case 'languages':
				result = await embedParser.parseLanguage(
					searchResults.languages[0].data as Language
				);
				break;
			case 'optionalFeatures':
				result = await embedParser.parseOptionalFeature(
					searchResults.optionalFeatures[0].data as OptionalFeature
				);
				break;
			case 'organizations':
				result = await embedParser.parseOrganization(
					searchResults.organizations[0].data as Organization
				);
				break;
			case 'places':
				result = await embedParser.parsePlace(searchResults.places[0].data as Place);
				break;
			case 'quickRules':
				result = await embedParser.parseQuickRule(
					searchResults.quickRules[0].data as QuickRule
				);
				break;
			case 'rituals':
				result = await embedParser.parseRitual(searchResults.rituals[0].data as Ritual);
				break;
			case 'relicGifts':
				result = await embedParser.parseRelicGift(
					searchResults.relicGifts[0].data as RelicGift
				);
				break;
			case 'skills':
				result = await embedParser.parseSkill(searchResults.skills[0].data as Skill);
				break;
			case 'spells':
				result = await embedParser.parseSpell(searchResults.spells[0].data as Spell);
				break;
			case 'tables':
				result = await embedParser.parseTable(searchResults.tables[0].data as Table);
				break;
			case 'traits':
				result = await embedParser.parseTrait(searchResults.traits[0].data as Trait);
				break;
			case 'variantRules':
				result = await embedParser.parseVariantRule(
					searchResults.variantRules[0].data as VariantRule
				);
				break;
			case 'vehicles':
				result = await embedParser.parseVehicle(searchResults.vehicles[0].data as Vehicle);
				break;
		}

		if (!result) {
			throw new KoboldError(
				"Yip! I couldn't find any results for that search in the compendium."
			);
		}

		await new KoboldEmbed(result).sendBatches(intr);
	}
}
