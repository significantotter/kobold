import { Table, inArray, sql } from 'drizzle-orm';
import { Pf2eToolsCompendiumModel } from '../compendium.model.js';
import * as schema from '../pf2eTools.schema.js';
import { DrizzleUtils } from './drizzle-utils.js';
import { Model } from '../models/lib/Model.js';
import { CompendiumEmbedParser } from '../parsers/compendium-parser.js';
import { StringUtils } from '@kobold/base-utils';
import { EmbedData } from 'discord.js';
import _ from 'lodash';
import type {
	Ability,
	Action,
	Affliction,
	Ancestry,
	VersatileHeritage,
	Archetype,
	Background,
	Creature,
	ClassFeature,
	Class,
	CompanionAbility,
	Companion,
	Condition,
	CreatureTemplate,
	Deity,
	Domain,
	Eidolon,
	FamiliarAbility,
	Familiar,
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
	Trait,
	VariantRule,
	Vehicle,
	Event as EventType,
	Table as TableType,
} from '../schemas/index.js';

type schemaKeys = Omit<typeof schema, 'Search'>;
export class Pf2eToolsUtils {
	public static tableNameToTable = {};

	public static async search(
		searchText: string,
		pf2eToolsCompendium: Pf2eToolsCompendiumModel,
		limit: number = 50
	) {
		let searchResult: Pf2eToolsCompendiumModel['search']['$inferSelect'][];
		if (searchText?.length > 3) {
			searchResult = await pf2eToolsCompendium.db.query.Search.findMany({
				where: DrizzleUtils.ilike(pf2eToolsCompendium.search.search, `%${searchText}%`),
				limit,
			});
		} else {
			// allow for discovery of entries
			searchResult = await pf2eToolsCompendium.db.query.Search.findMany({
				where: DrizzleUtils.ilike(pf2eToolsCompendium.search.search, `%${searchText}%`),
				limit,
				orderBy: sql`RANDOM()`,
			});
		}

		const resultsByTable = searchResult.reduce((byTable, result) => {
			const table = result.table as keyof schemaKeys;
			if (!byTable[table]) byTable[table] = [];
			byTable[table].push(result.id);
			return byTable;
		}, {} as Record<keyof schemaKeys, number[]>);
		const abilities = resultsByTable.Abilities?.length
			? pf2eToolsCompendium.db.query.Abilities.findMany({
					where: inArray(
						pf2eToolsCompendium.abilities.table.id,
						resultsByTable.Abilities
					),
			  })
			: [];
		const actions = resultsByTable.Actions?.length
			? pf2eToolsCompendium.db.query.Actions.findMany({
					where: inArray(pf2eToolsCompendium.actions.table.id, resultsByTable.Actions),
			  })
			: [];
		const afflictions = resultsByTable.Afflictions?.length
			? pf2eToolsCompendium.db.query.Afflictions.findMany({
					where: inArray(
						pf2eToolsCompendium.afflictions.table.id,
						resultsByTable.Afflictions
					),
			  })
			: [];
		const ancestries = resultsByTable.Ancestries?.length
			? pf2eToolsCompendium.db.query.Ancestries.findMany({
					where: inArray(
						pf2eToolsCompendium.ancestries.table.id,
						resultsByTable.Ancestries
					),
			  })
			: [];
		const versatileHeritages = resultsByTable.VersatileHeritages?.length
			? pf2eToolsCompendium.db.query.VersatileHeritages.findMany({
					where: inArray(
						pf2eToolsCompendium.versatileHeritages.table.id,
						resultsByTable.VersatileHeritages
					),
			  })
			: [];
		const archetypes = resultsByTable.Archetypes?.length
			? pf2eToolsCompendium.db.query.Archetypes.findMany({
					where: inArray(
						pf2eToolsCompendium.archetypes.table.id,
						resultsByTable.Archetypes
					),
			  })
			: [];
		const backgrounds = resultsByTable.Backgrounds?.length
			? pf2eToolsCompendium.db.query.Backgrounds.findMany({
					where: inArray(
						pf2eToolsCompendium.backgrounds.table.id,
						resultsByTable.Backgrounds
					),
			  })
			: [];
		const books = resultsByTable.Books?.length
			? pf2eToolsCompendium.db.query.Books.findMany({
					where: inArray(pf2eToolsCompendium.books.table.id, resultsByTable.Books),
			  })
			: [];
		const classFeatures = resultsByTable.ClassFeatures?.length
			? pf2eToolsCompendium.db.query.ClassFeatures.findMany({
					where: inArray(
						pf2eToolsCompendium.classFeatures.table.id,
						resultsByTable.ClassFeatures
					),
			  })
			: [];
		const classes = resultsByTable.Classes?.length
			? pf2eToolsCompendium.db.query.Classes.findMany({
					where: inArray(pf2eToolsCompendium.classes.table.id, resultsByTable.Classes),
			  })
			: [];
		const companionAbilities = resultsByTable.CompanionAbilities?.length
			? pf2eToolsCompendium.db.query.CompanionAbilities.findMany({
					where: inArray(
						pf2eToolsCompendium.companionAbilities.table.id,
						resultsByTable.CompanionAbilities
					),
			  })
			: [];
		const companions = resultsByTable.Companions?.length
			? pf2eToolsCompendium.db.query.Companions.findMany({
					where: inArray(
						pf2eToolsCompendium.companions.table.id,
						resultsByTable.Companions
					),
			  })
			: [];
		const conditions = resultsByTable.Conditions?.length
			? pf2eToolsCompendium.db.query.Conditions.findMany({
					where: inArray(
						pf2eToolsCompendium.conditions.table.id,
						resultsByTable.Conditions
					),
			  })
			: [];
		const creatures = resultsByTable.Creatures?.length
			? pf2eToolsCompendium.db.query.Creatures.findMany({
					where: inArray(
						pf2eToolsCompendium.creatures.table.id,
						resultsByTable.Creatures
					),
			  })
			: [];
		const creatureTemplates = resultsByTable.CreatureTemplates?.length
			? pf2eToolsCompendium.db.query.CreatureTemplates.findMany({
					where: inArray(
						pf2eToolsCompendium.creatureTemplates.table.id,
						resultsByTable.CreatureTemplates
					),
			  })
			: [];
		const deities = resultsByTable.Deities?.length
			? pf2eToolsCompendium.db.query.Deities.findMany({
					where: inArray(pf2eToolsCompendium.deities.table.id, resultsByTable.Deities),
			  })
			: [];
		const domains = resultsByTable.Domains?.length
			? pf2eToolsCompendium.db.query.Domains.findMany({
					where: inArray(pf2eToolsCompendium.domains.table.id, resultsByTable.Domains),
			  })
			: [];
		const eidolons = resultsByTable.Eidolons?.length
			? pf2eToolsCompendium.db.query.Eidolons.findMany({
					where: inArray(pf2eToolsCompendium.eidolons.table.id, resultsByTable.Eidolons),
			  })
			: [];
		const events = resultsByTable.Events?.length
			? pf2eToolsCompendium.db.query.Events.findMany({
					where: inArray(pf2eToolsCompendium.events.table.id, resultsByTable.Events),
			  })
			: [];
		const familiarAbilities = resultsByTable.FamiliarAbilities?.length
			? pf2eToolsCompendium.db.query.FamiliarAbilities.findMany({
					where: inArray(
						pf2eToolsCompendium.familiarAbilities.table.id,
						resultsByTable.FamiliarAbilities
					),
			  })
			: [];
		const familiars = resultsByTable.Familiars?.length
			? pf2eToolsCompendium.db.query.Familiars.findMany({
					where: inArray(
						pf2eToolsCompendium.familiars.table.id,
						resultsByTable.Familiars
					),
			  })
			: [];
		const feats = resultsByTable.Feats?.length
			? pf2eToolsCompendium.db.query.Feats.findMany({
					where: inArray(pf2eToolsCompendium.feats.table.id, resultsByTable.Feats),
			  })
			: [];
		const groups = resultsByTable.Groups?.length
			? pf2eToolsCompendium.db.query.Groups.findMany({
					where: inArray(pf2eToolsCompendium.groups.table.id, resultsByTable.Groups),
			  })
			: [];
		const hazards = resultsByTable.Hazards?.length
			? pf2eToolsCompendium.db.query.Hazards.findMany({
					where: inArray(pf2eToolsCompendium.hazards.table.id, resultsByTable.Hazards),
			  })
			: [];
		const items = resultsByTable.Items?.length
			? pf2eToolsCompendium.db.query.Items.findMany({
					where: inArray(pf2eToolsCompendium.items.table.id, resultsByTable.Items),
			  })
			: [];
		const languages = resultsByTable.Languages?.length
			? pf2eToolsCompendium.db.query.Languages.findMany({
					where: inArray(
						pf2eToolsCompendium.languages.table.id,
						resultsByTable.Languages
					),
			  })
			: [];
		const optionalFeatures = resultsByTable.OptionalFeatures?.length
			? pf2eToolsCompendium.db.query.OptionalFeatures.findMany({
					where: inArray(
						pf2eToolsCompendium.optionalFeatures.table.id,
						resultsByTable.OptionalFeatures
					),
			  })
			: [];
		const organizations = resultsByTable.Organizations?.length
			? pf2eToolsCompendium.db.query.Organizations.findMany({
					where: inArray(
						pf2eToolsCompendium.organizations.table.id,
						resultsByTable.Organizations
					),
			  })
			: [];
		const places = resultsByTable.Places?.length
			? pf2eToolsCompendium.db.query.Places.findMany({
					where: inArray(pf2eToolsCompendium.places.table.id, resultsByTable.Places),
			  })
			: [];
		const quickRules = resultsByTable.QuickRules?.length
			? pf2eToolsCompendium.db.query.QuickRules.findMany({
					where: inArray(
						pf2eToolsCompendium.quickRules.table.id,
						resultsByTable.QuickRules
					),
			  })
			: [];
		const relicGifts = resultsByTable.RelicGifts?.length
			? pf2eToolsCompendium.db.query.RelicGifts.findMany({
					where: inArray(
						pf2eToolsCompendium.relicGifts.table.id,
						resultsByTable.RelicGifts
					),
			  })
			: [];
		const rituals = resultsByTable.Rituals?.length
			? pf2eToolsCompendium.db.query.Rituals.findMany({
					where: inArray(pf2eToolsCompendium.rituals.table.id, resultsByTable.Rituals),
			  })
			: [];
		const skills = resultsByTable.Skills?.length
			? pf2eToolsCompendium.db.query.Skills.findMany({
					where: inArray(pf2eToolsCompendium.skills.table.id, resultsByTable.Skills),
			  })
			: [];
		const sources = resultsByTable.Sources?.length
			? pf2eToolsCompendium.db.query.Sources.findMany({
					where: inArray(pf2eToolsCompendium.sources.table.id, resultsByTable.Sources),
			  })
			: [];
		const spells = resultsByTable.Spells?.length
			? pf2eToolsCompendium.db.query.Spells.findMany({
					where: inArray(pf2eToolsCompendium.spells.table.id, resultsByTable.Spells),
			  })
			: [];
		const subclassFeatures = resultsByTable.SubclassFeatures?.length
			? pf2eToolsCompendium.db.query.SubclassFeatures.findMany({
					where: inArray(
						pf2eToolsCompendium.subclassFeatures.table.id,
						resultsByTable.SubclassFeatures
					),
			  })
			: [];
		const tables = resultsByTable.Tables?.length
			? pf2eToolsCompendium.db.query.Tables.findMany({
					where: inArray(pf2eToolsCompendium.tables.table.id, resultsByTable.Tables),
			  })
			: [];
		const traits = resultsByTable.Traits?.length
			? pf2eToolsCompendium.db.query.Traits.findMany({
					where: inArray(pf2eToolsCompendium.traits.table.id, resultsByTable.Traits),
			  })
			: [];
		const variantRules = resultsByTable.VariantRules?.length
			? pf2eToolsCompendium.db.query.VariantRules.findMany({
					where: inArray(
						pf2eToolsCompendium.variantRules.table.id,
						resultsByTable.VariantRules
					),
			  })
			: [];
		const vehicles = resultsByTable.Vehicles?.length
			? pf2eToolsCompendium.db.query.Vehicles.findMany({
					where: inArray(pf2eToolsCompendium.vehicles.table.id, resultsByTable.Vehicles),
			  })
			: [];
		const results = await Promise.all([
			abilities,
			actions,
			afflictions,
			archetypes,
			ancestries,
			versatileHeritages,
			backgrounds,
			books,
			classFeatures,
			classes,
			companionAbilities,
			companions,
			conditions,
			creatures,
			creatureTemplates,
			deities,
			domains,
			eidolons,
			events,
			familiarAbilities,
			familiars,
			feats,
			groups,
			hazards,
			items,
			languages,
			optionalFeatures,
			organizations,
			places,
			quickRules,
			relicGifts,
			rituals,
			skills,
			sources,
			spells,
			subclassFeatures,
			tables,
			traits,
			variantRules,
			vehicles,
		]);
		return {
			abilities: await abilities,
			actions: await actions,
			afflictions: await afflictions,
			archetypes: await archetypes,
			ancestries: await ancestries,
			versatileHeritages: await versatileHeritages,
			backgrounds: await backgrounds,
			books: await books,
			classFeatures: await classFeatures,
			classes: await classes,
			companionAbilities: await companionAbilities,
			companions: await companions,
			conditions: await conditions,
			creatures: await creatures,
			creatureTemplates: await creatureTemplates,
			deities: await deities,
			domains: await domains,
			eidolons: await eidolons,
			events: await events,
			familiarAbilities: await familiarAbilities,
			familiars: await familiars,
			feats: await feats,
			groups: await groups,
			hazards: await hazards,
			items: await items,
			languages: await languages,
			optionalFeatures: await optionalFeatures,
			organizations: await organizations,
			places: await places,
			quickRules: await quickRules,
			relicGifts: await relicGifts,
			rituals: await rituals,
			skills: await skills,
			sources: await sources,
			spells: await spells,
			subclassFeatures: await subclassFeatures,
			tables: await tables,
			traits: await traits,
			variantRules: await variantRules,
			vehicles: await vehicles,
		};
	}
	public static async getSearchNameValue(
		searchText: string,
		pf2eToolsCompendium: Pf2eToolsCompendiumModel
	) {
		const search = await Pf2eToolsUtils.search(searchText, pf2eToolsCompendium, 50);
		return Object.entries(search)
			.map(([modelName, results]) => {
				const model = pf2eToolsCompendium[
					modelName as keyof Pf2eToolsCompendiumModel
				] as Model<any, any>;
				return results.map(result => {
					try {
						const searchableResult = model.generateSearchText(result.data);
						return {
							name: searchableResult,
							value: searchableResult,
						};
					} catch (err) {
						console.warn(modelName, result, err);
						return {
							name: result.name,
							value: result.name,
						};
					}
				});
			})
			.flat();
	}

	public static async parseSearchResult(
		searchResults: Awaited<ReturnType<typeof Pf2eToolsUtils.search>>,
		searchTerm: string,
		embedParser: CompendiumEmbedParser
	) {
		let result: EmbedData | undefined = undefined;
		const closestMatchSorter = StringUtils.generateSorterByWordDistance(
			searchTerm,
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
				result = await embedParser.parseTable(searchResults.tables[0].data as TableType);
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
		return result;
	}
}
