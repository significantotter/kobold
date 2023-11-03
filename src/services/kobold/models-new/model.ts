import { Insertable, Kysely, Selectable, Updateable } from 'kysely';
import Database from '../schemas/kanel/Database.js';
import { ValueOf } from 'type-fest';
type foo = Database[];

export abstract class Model<T extends ValueOf<Database>> {
	constructor(protected db: Kysely<Database>) {}
	abstract create(args: Insertable<T>): Promise<Selectable<T>>;
	abstract read(target: any): Promise<Selectable<T> | null>;
	abstract update(target: any, args: Updateable<T>): Promise<Selectable<T>>;
	abstract delete(target: any): Promise<void>;
}
