import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { Config } from '@kobold/config';
import * as schema from './nethys.schema.js';
import { and, eq, ilike, sql } from 'drizzle-orm';

export class NethysDb {
	public client: ReturnType<typeof postgres>;
	public db: PostgresJsDatabase<typeof schema>;
	constructor(public url = Config.database.url) {
		this.client = postgres(url);
		this.db = drizzle(this.client, { schema });
	}
	searchTerm<B extends boolean, R extends boolean>(
		searchTerm: string,
		{
			limit = 50,
			searchTermOnly,
			randomOrder = false,
			bestiary,
		}: {
			limit?: number;
			searchTermOnly: R;
			randomOrder?: boolean;
			bestiary: B;
		}
	): R extends true
		? Promise<{ search: string }[]>
		: B extends true
		? Promise<schema.BestiaryRow[]>
		: Promise<schema.CompendiumRow[]> {
		const table = bestiary ? schema.bestiary : schema.compendium;
		const select = searchTermOnly ? this.db.select({ search: table.search }) : this.db.select();
		const selectFromWhere = select
			.from(table)
			.where(and(ilike(table.search, `%${searchTerm}%`), eq(table.excludeFromSearch, false)))
			.limit(limit);
		const selectFromWhereOrder = randomOrder
			? selectFromWhere.orderBy(sql`random()`)
			: selectFromWhere;
		return selectFromWhereOrder.execute() as any;
	}
	search<B extends boolean, R extends boolean>(
		searchTerm: string,
		{
			limit = 50,
			searchTermOnly = false as R,
			randomOrder = false,
			bestiary = false as B,
		}: {
			limit?: number;
			searchTermOnly: R;
			randomOrder?: boolean;
			bestiary: B;
		}
	): R extends true
		? Promise<{ search: string }[]>
		: B extends true
		? Promise<schema.BestiaryRow[]>
		: Promise<schema.CompendiumRow[]> {
		const table = bestiary ? schema.bestiary : schema.compendium;
		const select = searchTermOnly ? this.db.select({ search: table.search }) : this.db.select();
		const selectFromWhere = select
			.from(table)
			.where(and(ilike(table.search, `%${searchTerm}%`), eq(table.excludeFromSearch, false)))
			.limit(limit);
		const selectOrder = randomOrder ? selectFromWhere.orderBy(sql`random()`) : selectFromWhere;
		return selectOrder.execute() as any;
	}
}
