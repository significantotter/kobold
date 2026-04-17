import { Client, estypes } from '@elastic/elasticsearch';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import { CompendiumEntry } from './schemas/index.js';

export function valueAsJsonb(input: unknown) {
	return JSON.stringify(input).replaceAll("'", "''");
}

export interface NethysLoaderLogger {
	info(message: string): void;
	error(message: string, error?: unknown): void;
}

const consoleLogger: NethysLoaderLogger = {
	info: (message: string) => console.info(message),
	error: (message: string, error?: unknown) => console.error(message, error),
};

const STAGING_COMPENDIUM = 'nethys_compendium_staging';
const STAGING_BESTIARY = 'nethys_bestiary_staging';

const DATA_COLUMNS = [
	'name',
	'category',
	'level',
	'game_system',
	'elastic_index',
	'elastic_id',
	'nethys_id',
	'search',
	'exclude_from_search',
	'tags',
	'data',
] as const;

export class NethysLoader {
	protected client: Client;
	protected gameSystem: string;
	protected indexName: string;
	protected logger: NethysLoaderLogger;
	protected pgClient: ReturnType<typeof postgres>;

	constructor({
		url = 'https://elasticsearch.aonprd.com',
		gameSystem = 'pf2e',
		indexName = 'aon',
		logger = consoleLogger,
		databaseUrl,
	}: {
		url?: string;
		gameSystem?: string;
		indexName?: string;
		logger?: NethysLoaderLogger;
		databaseUrl: string;
	}) {
		this.client = new Client({ node: url });
		this.gameSystem = gameSystem;
		this.indexName = indexName;
		this.logger = logger;
		// Ignore the initial warning about the IF EXISTS check in the staging table creation, since it will always be true on the first run and we don't want that polluting the logs
		this.pgClient = postgres(databaseUrl, { onnotice: () => {} });
	}

	protected pageSize = 1000;

	public async *getScroll() {
		const params: estypes.SearchRequest | undefined = {
			size: this.pageSize,
			scroll: '1m',
			query: {
				match_all: {},
			},
			index: this.indexName,
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

	protected transformHit(hit: estypes.SearchHit<unknown>) {
		const data = hit._source as CompendiumEntry;
		const index = parseInt(hit._index.replace(/\D+/g, ''));
		return {
			name: 'name' in data ? data.name : hit._id,
			category: 'type' in data ? data.type : 'unknown',
			level: 'level' in data ? data.level : null,
			game_system: this.gameSystem,
			elastic_index: index,
			elastic_id: hit._id,
			nethys_id: data.id,
			exclude_from_search: 'exclude_from_search' in data ? data.exclude_from_search : false,
			search: `(${data.category}${
				'level' in data && data.level != null ? ' ' + data.level : ''
			}) ${data.name}${'remaster_id' in data ? ' (legacy)' : ''}`,
			tags: JSON.stringify(data.trait ?? []),
			data: JSON.stringify(data),
		};
	}

	protected async ingestPageToStaging(page: estypes.SearchHit<unknown>[]) {
		const rows = page.map(hit => this.transformHit(hit));

		// Insert into compendium staging
		for (let i = 0; i < rows.length; i += 1000) {
			const batch = rows.slice(i, i + 1000);
			await this.pgClient`
				INSERT INTO ${this.pgClient(STAGING_COMPENDIUM)}
					${this.pgClient(batch, ...DATA_COLUMNS)}
				ON CONFLICT (game_system, elastic_id) DO UPDATE SET
					data = EXCLUDED.data,
					elastic_index = EXCLUDED.elastic_index
				WHERE EXCLUDED.elastic_index > ${this.pgClient(STAGING_COMPENDIUM)}.elastic_index
			`;
		}

		// Insert creatures into bestiary staging
		const creatures = rows.filter(r => r.category.toLowerCase() === 'creature');
		if (creatures.length > 0) {
			await this.pgClient`
				INSERT INTO ${this.pgClient(STAGING_BESTIARY)}
					${this.pgClient(creatures, ...DATA_COLUMNS)}
				ON CONFLICT (game_system, elastic_id) DO UPDATE SET
					data = EXCLUDED.data,
					elastic_index = EXCLUDED.elastic_index
				WHERE EXCLUDED.elastic_index > ${this.pgClient(STAGING_BESTIARY)}.elastic_index
			`;
		}
	}

	protected async createStagingTables() {
		await this.pgClient.unsafe(
			`DROP TABLE IF EXISTS ${STAGING_COMPENDIUM}; DROP TABLE IF EXISTS ${STAGING_BESTIARY}`
		);
		await this.pgClient.unsafe(
			`CREATE TABLE ${STAGING_COMPENDIUM} (LIKE nethys_compendium INCLUDING DEFAULTS INCLUDING INDEXES INCLUDING CONSTRAINTS)`
		);
		await this.pgClient.unsafe(
			`CREATE TABLE ${STAGING_BESTIARY} (LIKE nethys_bestiary INCLUDING DEFAULTS INCLUDING INDEXES INCLUDING CONSTRAINTS)`
		);
	}

	protected async dropStagingTables() {
		await this.pgClient.unsafe(
			`DROP TABLE IF EXISTS ${STAGING_COMPENDIUM}; DROP TABLE IF EXISTS ${STAGING_BESTIARY}`
		);
	}

	protected async swapStagingToMain() {
		const columns = DATA_COLUMNS.join(', ');
		const gs = this.gameSystem.replaceAll("'", "''");
		await this.pgClient.begin(async sql => {
			await sql.unsafe(`DELETE FROM nethys_compendium WHERE game_system = '${gs}'`);
			await sql.unsafe(
				`INSERT INTO nethys_compendium (${columns}) SELECT ${columns} FROM ${STAGING_COMPENDIUM}`
			);
			await sql.unsafe(`DELETE FROM nethys_bestiary WHERE game_system = '${gs}'`);
			await sql.unsafe(
				`INSERT INTO nethys_bestiary (${columns}) SELECT ${columns} FROM ${STAGING_BESTIARY}`
			);
			await sql.unsafe(`DROP TABLE ${STAGING_COMPENDIUM}`);
			await sql.unsafe(`DROP TABLE ${STAGING_BESTIARY}`);
		});
	}

	public async load() {
		try {
			this.logger.info(`Creating staging tables for ${this.gameSystem} import.`);
			await this.createStagingTables();

			let countIngested = 0;
			for await (const page of this.getScroll()) {
				await this.ingestPageToStaging(page);
				countIngested += page.length;
				this.logger.info(
					`${countIngested} ${this.gameSystem} records ingested to staging.`
				);
			}

			this.logger.info(
				`Swapping ${countIngested} ${this.gameSystem} records from staging to main tables.`
			);
			await this.swapStagingToMain();
			this.logger.info(`Done ingesting ${this.gameSystem} data.`);
		} catch (error) {
			this.logger.error(
				`Error during ${this.gameSystem} import, cleaning up staging tables.`,
				error
			);
			await this.dropStagingTables();
			throw error;
		} finally {
			this.client.close();
		}
	}

	public async close() {
		await this.pgClient.end();
	}
}
