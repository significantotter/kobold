import { getTableColumns, inArray } from 'drizzle-orm';
import { CompendiumModel } from '../compendium.model.js';
import * as schema from '../pf2eTools.schema.js';
import { DrizzleUtils } from './drizzle-utils.js';
import {
	SQLiteTableWithColumns,
	TableConfig,
	integer,
	sqliteTable,
	text,
	getTableConfig,
	SQLiteColumn,
} from 'drizzle-orm/sqlite-core';
import { db } from '../pf2eTools.db.js';
import { Model } from '../models/lib/Model.js';

type schemaKeys = Omit<typeof schema, 'Search'>;
// const SearchableTable = sqliteTable('Searchable', {
// 	id: integer('id').primaryKey().notNull(),
// 	name: text('name').notNull(),
// 	search: text('search').notNull(),
// 	tags: text('tags', { mode: 'json' }).notNull().$type<string[]>(),
// 	data: text('data', { mode: 'json' }).notNull().$type<any>(),
// });
// const columns = getTableColumns(SearchableTable);
// const columns = {
// 	id: integer('id').primaryKey().notNull()._,
// 	name: text('name').notNull()._,
// 	search: text('search').notNull()._,
// 	tags: text('tags', { mode: 'json' }).notNull().$type<string[]>()._,
// };
// interface columns {
// 	[k: string]: SQLiteColumn<any, any>;
// 	id: SQLiteColumn<
// 		{
// 			name: 'id';
// 			tableName: keyof schemaKeys;
// 			dataType: 'number';
// 			columnType: 'SQLiteInteger';
// 			data: number;
// 			driverParam: number;
// 			notNull: true;
// 			hasDefault: boolean;
// 			enumValues: undefined;
// 			baseColumn: never;
// 		},
// 		object
// 	>;
// 	name: SQLiteColumn<
// 		{
// 			name: 'name';
// 			tableName: keyof schemaKeys;
// 			dataType: 'string';
// 			columnType: 'SQLiteText';
// 			data: string;
// 			driverParam: string;
// 			notNull: true;
// 			hasDefault: false;
// 			enumValues: [string, ...string[]];
// 			baseColumn: never;
// 		},
// 		object
// 	>;
// 	search: SQLiteColumn<
// 		{
// 			name: 'search';
// 			tableName: keyof schemaKeys;
// 			dataType: 'string';
// 			columnType: 'SQLiteText';
// 			data: string;
// 			driverParam: string;
// 			notNull: true;
// 			hasDefault: false;
// 			enumValues: [string, ...string[]];
// 			baseColumn: never;
// 		},
// 		object
// 	>;
// 	tags: SQLiteColumn<
// 		{
// 			name: 'tags';
// 			tableName: keyof schemaKeys;
// 			dataType: 'json';
// 			columnType: 'SQLiteTextJson';
// 			data: string[];
// 			driverParam: string;
// 			notNull: true;
// 			hasDefault: false;
// 			enumValues: undefined;
// 			baseColumn: never;
// 		},
// 		object
// 	>;
// 	data: SQLiteColumn<
// 		{
// 			name: 'data';
// 			tableName: keyof schemaKeys;
// 			dataType: 'json';
// 			columnType: 'SQLiteTextJson';
// 			data: any;
// 			driverParam: string;
// 			notNull: true;
// 			hasDefault: false;
// 			enumValues: undefined;
// 			baseColumn: never;
// 		},
// 		object
// 	>;
// }
// schema.Abilities.data;

// const inferSelect = SearchableTable._.inferSelect;
// const inferInsert = SearchableTable._.inferInsert;

// interface SearchableTableConfig extends TableConfig {
// 	brand: 'Table';
// 	config: TableConfig;
// 	name: string;
// 	schema: string | undefined;
// 	columns: columns;
// 	inferSelect: typeof inferSelect;
// 	inferInsert: typeof inferInsert;
// }

// interface Searchable extends SQLiteTableWithColumns<SearchableTableConfig> {
// 	_: SearchableTableConfig;
// 	id: columns['id'];
// 	name: columns['name'];
// 	search: columns['search'];
// 	tags: columns['tags'];
// }

export class CompendiumUtils {
	public static tableNameToTable = {};

	public static async search(
		searchText: string,
		compendium: CompendiumModel,
		limit: number = 50
	) {
		const searchResult = await compendium.db.query.Search.findMany({
			where: DrizzleUtils.ilike(compendium.search.search, `%${searchText}%`),
			limit,
		});

		const resultsByTable = searchResult.reduce(
			(byTable, result) => {
				const table = result.table as keyof schemaKeys;
				if (!byTable[table]) byTable[table] = [];
				byTable[table].push(result.id);
				return byTable;
			},
			{} as Record<keyof schemaKeys, number[]>
		);
		const abilities = resultsByTable.Abilities?.length
			? compendium.db.query.Abilities.findMany({
					where: inArray(compendium.abilities.table.id, resultsByTable.Abilities),
			  })
			: [];
		const actions = resultsByTable.Actions?.length
			? compendium.db.query.Actions.findMany({
					where: inArray(compendium.actions.table.id, resultsByTable.Actions),
			  })
			: [];
		const afflictions = resultsByTable.Afflictions?.length
			? compendium.db.query.Afflictions.findMany({
					where: inArray(compendium.afflictions.table.id, resultsByTable.Afflictions),
			  })
			: [];
		const archetypes = resultsByTable.Archetypes?.length
			? compendium.db.query.Archetypes.findMany({
					where: inArray(compendium.archetypes.table.id, resultsByTable.Archetypes),
			  })
			: [];
		const backgrounds = resultsByTable.Backgrounds?.length
			? compendium.db.query.Backgrounds.findMany({
					where: inArray(compendium.backgrounds.table.id, resultsByTable.Backgrounds),
			  })
			: [];
		const books = resultsByTable.Books?.length
			? compendium.db.query.Books.findMany({
					where: inArray(compendium.books.table.id, resultsByTable.Books),
			  })
			: [];
		const classFeatures = resultsByTable.ClassFeatures?.length
			? compendium.db.query.ClassFeatures.findMany({
					where: inArray(compendium.classFeatures.table.id, resultsByTable.ClassFeatures),
			  })
			: [];
		const classes = resultsByTable.Classes?.length
			? compendium.db.query.Classes.findMany({
					where: inArray(compendium.classes.table.id, resultsByTable.Classes),
			  })
			: [];
		const companionAbilities = resultsByTable.CompanionAbilities?.length
			? compendium.db.query.CompanionAbilities.findMany({
					where: inArray(
						compendium.companionAbilities.table.id,
						resultsByTable.CompanionAbilities
					),
			  })
			: [];
		const companions = resultsByTable.Companions?.length
			? compendium.db.query.Companions.findMany({
					where: inArray(compendium.companions.table.id, resultsByTable.Companions),
			  })
			: [];
		const conditions = resultsByTable.Conditions?.length
			? compendium.db.query.Conditions.findMany({
					where: inArray(compendium.conditions.table.id, resultsByTable.Conditions),
			  })
			: [];
		const creatures = resultsByTable.Creatures?.length
			? compendium.db.query.Creatures.findMany({
					where: inArray(compendium.creatures.table.id, resultsByTable.Creatures),
			  })
			: [];
		const creatureTemplates = resultsByTable.CreatureTemplates?.length
			? compendium.db.query.CreatureTemplates.findMany({
					where: inArray(
						compendium.creatureTemplates.table.id,
						resultsByTable.CreatureTemplates
					),
			  })
			: [];
		const deities = resultsByTable.Deities?.length
			? compendium.db.query.Deities.findMany({
					where: inArray(compendium.deities.table.id, resultsByTable.Deities),
			  })
			: [];
		const domains = resultsByTable.Domains?.length
			? compendium.db.query.Domains.findMany({
					where: inArray(compendium.domains.table.id, resultsByTable.Domains),
			  })
			: [];
		const eidolons = resultsByTable.Eidolons?.length
			? compendium.db.query.Eidolons.findMany({
					where: inArray(compendium.eidolons.table.id, resultsByTable.Eidolons),
			  })
			: [];
		const events = resultsByTable.Events?.length
			? compendium.db.query.Events.findMany({
					where: inArray(compendium.events.table.id, resultsByTable.Events),
			  })
			: [];
		const familiarAbilities = resultsByTable.FamiliarAbilities?.length
			? compendium.db.query.FamiliarAbilities.findMany({
					where: inArray(
						compendium.familiarAbilities.table.id,
						resultsByTable.FamiliarAbilities
					),
			  })
			: [];
		const familiars = resultsByTable.Familiars?.length
			? compendium.db.query.Familiars.findMany({
					where: inArray(compendium.familiars.table.id, resultsByTable.Familiars),
			  })
			: [];
		const feats = resultsByTable.Feats?.length
			? compendium.db.query.Feats.findMany({
					where: inArray(compendium.feats.table.id, resultsByTable.Feats),
			  })
			: [];
		const groups = resultsByTable.Groups?.length
			? compendium.db.query.Groups.findMany({
					where: inArray(compendium.groups.table.id, resultsByTable.Groups),
			  })
			: [];
		const hazards = resultsByTable.Hazards?.length
			? compendium.db.query.Hazards.findMany({
					where: inArray(compendium.hazards.table.id, resultsByTable.Hazards),
			  })
			: [];
		const items = resultsByTable.Items?.length
			? compendium.db.query.Items.findMany({
					where: inArray(compendium.items.table.id, resultsByTable.Items),
			  })
			: [];
		const languages = resultsByTable.Languages?.length
			? compendium.db.query.Languages.findMany({
					where: inArray(compendium.languages.table.id, resultsByTable.Languages),
			  })
			: [];
		const optionalFeatures = resultsByTable.OptionalFeatures?.length
			? compendium.db.query.OptionalFeatures.findMany({
					where: inArray(
						compendium.optionalFeatures.table.id,
						resultsByTable.OptionalFeatures
					),
			  })
			: [];
		const organizations = resultsByTable.Organizations?.length
			? compendium.db.query.Organizations.findMany({
					where: inArray(compendium.organizations.table.id, resultsByTable.Organizations),
			  })
			: [];
		const places = resultsByTable.Places?.length
			? compendium.db.query.Places.findMany({
					where: inArray(compendium.places.table.id, resultsByTable.Places),
			  })
			: [];
		const quickRules = resultsByTable.QuickRules?.length
			? compendium.db.query.QuickRules.findMany({
					where: inArray(compendium.quickRules.table.id, resultsByTable.QuickRules),
			  })
			: [];
		const relicGifts = resultsByTable.RelicGifts?.length
			? compendium.db.query.RelicGifts.findMany({
					where: inArray(compendium.relicGifts.table.id, resultsByTable.RelicGifts),
			  })
			: [];
		const rituals = resultsByTable.Rituals?.length
			? compendium.db.query.Rituals.findMany({
					where: inArray(compendium.rituals.table.id, resultsByTable.Rituals),
			  })
			: [];
		const skills = resultsByTable.Skills?.length
			? compendium.db.query.Skills.findMany({
					where: inArray(compendium.skills.table.id, resultsByTable.Skills),
			  })
			: [];
		const sources = resultsByTable.Sources?.length
			? compendium.db.query.Sources.findMany({
					where: inArray(compendium.sources.table.id, resultsByTable.Sources),
			  })
			: [];
		const spells = resultsByTable.Spells?.length
			? compendium.db.query.Spells.findMany({
					where: inArray(compendium.spells.table.id, resultsByTable.Spells),
			  })
			: [];
		const subclassFeatures = resultsByTable.SubclassFeatures?.length
			? compendium.db.query.SubclassFeatures.findMany({
					where: inArray(
						compendium.subclassFeatures.table.id,
						resultsByTable.SubclassFeatures
					),
			  })
			: [];
		// const tables = resultsByTable.Tables?.length
		// 	? compendium.db.query.Tables.findMany({
		// 			where: inArray(compendium.tables.table.id, resultsByTable.Tables),
		// 	  })
		// 	: [];
		const traits = resultsByTable.Traits?.length
			? compendium.db.query.Traits.findMany({
					where: inArray(compendium.traits.table.id, resultsByTable.Traits),
			  })
			: [];
		const variantRules = resultsByTable.VariantRules?.length
			? compendium.db.query.VariantRules.findMany({
					where: inArray(compendium.variantRules.table.id, resultsByTable.VariantRules),
			  })
			: [];
		const vehicles = resultsByTable.Vehicles?.length
			? compendium.db.query.Vehicles.findMany({
					where: inArray(compendium.vehicles.table.id, resultsByTable.Vehicles),
			  })
			: [];
		const results = await Promise.all([
			abilities,
			actions,
			afflictions,
			archetypes,
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
			// tables,
			traits,
			variantRules,
			vehicles,
		]);
		return {
			abilities: await abilities,
			actions: await actions,
			afflictions: await afflictions,
			archetypes: await archetypes,
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
			// tables: await tables,
			traits: await traits,
			variantRules: await variantRules,
			vehicles: await vehicles,
		};
	}
	public static async getSearchNameValue(searchText: string, compendium: CompendiumModel) {
		const search = await CompendiumUtils.search(searchText, compendium, 50);
		return Object.entries(search)
			.map(([modelName, results]) => {
				const model = compendium[modelName as keyof CompendiumModel] as Model<any, any>;
				return results.map(result => {
					const searchableResult = model.generateSearchText(result.data);
					return {
						name: searchableResult,
						value: searchableResult,
					};
				});
			})
			.flat();
	}
}
