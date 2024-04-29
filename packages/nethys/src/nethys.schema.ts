import { integer, text, jsonb, serial, pgTableCreator, boolean, unique } from 'drizzle-orm/pg-core';
import { BestiaryEntry, CompendiumEntry } from './schemas/index.js';
const pgTable = pgTableCreator(name => `nethys_${name}`);
const standardFields = {
	id: serial('id').primaryKey().notNull(),
	name: text('name').notNull(),
	category: text('category').notNull(),
	level: integer('level'),
	elasticIndex: integer('elastic_index').notNull(),
	elasticId: text('elastic_id').notNull().unique(),
	nethysId: text('nethys_id').unique().notNull(),
	search: text('search').notNull(),
	excludeFromSearch: boolean('exclude_from_search').notNull(),
	tags: jsonb('tags').notNull().$type<string[]>(),
};
export type CompendiumRow = typeof compendium.$inferSelect;
export const compendium = pgTable('compendium', {
	...standardFields,
	data: jsonb('data').notNull().$type<CompendiumEntry>(),
});
export type BestiaryRow = typeof bestiary.$inferSelect;
export const bestiary = pgTable('bestiary', {
	...standardFields,
	data: jsonb('data').notNull().$type<BestiaryEntry>(),
});
