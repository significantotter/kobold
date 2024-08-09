import { db, postgresClient } from '../nethys.db.js';
import { compendium, bestiary } from '../nethys.schema.js';
import { Client, estypes } from '@elastic/elasticsearch';
import { sql } from 'drizzle-orm';
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types.js';
import { CompendiumEntry } from '../schemas/index.js';
export function valueAsJsonb(input: unknown) {
	return sql.raw(`'${JSON.stringify(input).replaceAll("'", "''")}'::jsonb`);
}

export class NethysLoader {
	protected client: Client;
	constructor(
		{ url = 'https://elasticsearch.aonprd.com' }: { url: string } = {
			url: 'https://elasticsearch.aonprd.com',
		}
	) {
		this.client = new Client({ node: url });
	}
	protected pageSize = 1000;

	// Scroll utility
	public async *getScroll() {
		const params: estypes.SearchRequest | SearchRequest | undefined = {
			size: this.pageSize,
			scroll: '1m',
			query: {
				match_all: {},
			},
			index: 'aon',
		};
		let response = await this.client.search(params);

		while (true) {
			const sourceHits = response.hits.hits;

			if (sourceHits.length === 0) {
				break;
			}

			yield sourceHits;

			if (!response._scroll_id) {
				break;
			}

			response = await this.client.scroll({
				scroll_id: response._scroll_id,
				scroll: params.scroll,
			});
		}
	}

	public async ingestPageToDb(page: estypes.SearchHit<unknown>[]) {
		const values = page.map(hit => {
			const data = hit._source as CompendiumEntry;
			const index = parseInt(hit._index.replace('aon', ''));
			return {
				name: 'name' in data ? data.name : hit._id,
				category: 'type' in data ? data.type : 'unknown',
				level: 'level' in data ? data.level : null,
				elasticIndex: index,
				elasticId: hit._id,
				nethysId: data.id,
				excludeFromSearch: 'exclude_from_search' in data ? data.exclude_from_search : false,
				search: `(${data.category}${
					'level' in data && data.level != null ? ' ' + data.level : ''
				}) ${data.name}${'remaster_id' in data ? ' (legacy)' : ''}`,
				tags: valueAsJsonb(data.trait ?? []),
				data: valueAsJsonb(data),
			};
		});
		const batches = [];
		for (let i = 0; i < values.length; i += 1000) {
			batches.push(values.slice(i, i + 1000));
		}
		for (const batch of batches) {
			const insert = db
				.insert(compendium)
				.values(batch)
				.onConflictDoUpdate({
					target: compendium.elasticId,
					set: { data: sql`EXCLUDED.data`, elasticIndex: sql`EXCLUDED.elastic_index` },
					setWhere: sql`EXCLUDED.elastic_index > nethys_compendium.elastic_index`,
				});
			await insert.execute();
			const creatureBatch = values.filter(v => v.category.toLowerCase() === 'creature');
			if (creatureBatch.length > 0) {
				await db
					.insert(bestiary)
					.values(creatureBatch as any)
					.onConflictDoUpdate({
						target: bestiary.elasticId,
						set: {
							data: sql`EXCLUDED.data`,
							elasticIndex: sql`EXCLUDED.elastic_index`,
						},
						setWhere: sql`EXCLUDED.elastic_index > nethys_bestiary.elastic_index`,
					})
					.execute();
			}
		}
	}
	public async clearDb() {
		await db.delete(compendium).execute();
		await db.delete(bestiary).execute();
	}
	public getTotalFromPage(page: estypes.SearchResponse): number {
		if (page.hits.total === undefined) throw new Error("Couldn't get the total from the page!");
		return typeof page.hits.total === 'number' ? page.hits.total : page.hits.total.value;
	}
	public async load() {
		// delete the current schema
		await this.clearDb();
		console.info('Wiped the current data.');

		// ingest the rest of the pages
		let countIngested = 0;
		// start fetching data from the nethys elasticsearch api
		for await (const page of this.getScroll()) {
			// ingest the page
			await this.ingestPageToDb(page);
			countIngested += page.length;
			console.info(`${countIngested} records ingested.`);
		}
		console.info('Done ingesting data. Shutting down');
		this.client.close();
		postgresClient.end();
	}
}

const loader = new NethysLoader();
await loader.load();
