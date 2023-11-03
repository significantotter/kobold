import { Kysely } from 'kysely';
import Database from '../schemas/kanel/Database.js';
type foo = Database[];

export abstract class Model<T extends Database> {
	constructor(protected db: Kysely<Database>) {}
	abstract read(args: any): Promise<Database['bestiaryFilesLoaded']>;
}
