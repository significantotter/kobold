import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { z } from 'zod';
import { SQLiteTable, TableConfig } from 'drizzle-orm/sqlite-core';
import * as schema from '../../pf2eTools.schema.js';

export abstract class Model<T extends z.ZodTypeAny, K extends SQLiteTable<TableConfig>> {
	public abstract db: BetterSQLite3Database<typeof schema>;
	public abstract z: T;
	public abstract table: K;

	public abstract getFiles(): any[];
	public abstract resourceListFromFile(file: any): any[];
	public abstract import(): Promise<void>;
	public abstract generateSearchText(resource: z.infer<T>): string;
	public abstract generateTags(resource: z.infer<T>): string[];

	public async _importData() {
		//truncate the existing entries
		const ids = await this.db.delete(this.table).run();

		const jsonFiles = this.getFiles();

		for (const jsonFile of jsonFiles) {
			for (const resource of this.resourceListFromFile(jsonFile)) {
				console.log(resource?.name);
				const parse = this.z.safeParse(resource);

				if (!parse.success) {
					console.dir(parse.error.format(), { depth: null });
					console.dir(resource, { depth: null });
					throw new Error();
				}
				const result = parse.data;
				await this.db
					.insert(this.table)
					.values({
						name: result.name,
						search: this.generateSearchText(result),
						tags: this.generateTags(result),
						data: result,
					} as any)
					.run();
			}
		}
	}
}
