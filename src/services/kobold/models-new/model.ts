import { Kysely, Selectable } from 'kysely';
import Database from '../schemas/kanel/Database.js';
import { ValueOf } from 'type-fest';
type foo = Database[];

export abstract class Model<T extends ValueOf<Database>> {
	constructor(protected db: Kysely<Database>) {}
	abstract read(args: any): Promise<Selectable<Database['bestiaryFilesLoaded']>>;
}
