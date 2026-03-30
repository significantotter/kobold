import { Insertable, Kysely, Selectable, Updateable } from 'kysely';
import { ValueOf } from 'type-fest';
import { Database } from '../schemas/index.js';

export abstract class Model<T extends ValueOf<Database>> {
	constructor(protected db: Kysely<Database>) {}
	/**
	 * Creates a new row in the table.
	 */
	abstract create(args: Insertable<T>): Promise<Selectable<T>>;
	/**
	 * Reads a row from the table.
	 */
	abstract read(target: any): Promise<Selectable<T> | null>;
	/**
	 * Updates a row in the table.
	 */
	abstract update(target: any, args: Updateable<T>): Promise<Selectable<T>>;
	/**
	 * Deletes a row from the table.
	 */
	abstract delete(target: any): Promise<void>;
}
