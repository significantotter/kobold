import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { Ability } from './pf2etools-types.js';

export const abilities = sqliteTable('abilities', {
	id: integer('id').primaryKey(),
	name: text('name'),
	tags: text('tags', { mode: 'json' }).$type<string[]>(),
	data: text('data', { mode: 'json' }).$type<Ability>(),
});

export const actions = sqliteTable('actions', {
	id: integer('id').primaryKey(),
	name: text('name'),
	tags: text('tags', { mode: 'json' }).$type<string[]>(),
	data: text('data', { mode: 'json' }).$type<Ability>(),
});
