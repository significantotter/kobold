import { Kysely } from 'kysely';
import Database from '../schemas/kanel/Database.js';

export class BestiaryFilesLoaded {
	constructor(db: Kysely<Database>) {}
}
