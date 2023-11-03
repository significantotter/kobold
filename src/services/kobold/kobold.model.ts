import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import Database from './schemas/kanel/Database.js';
import { BestiaryFilesLoadedModel, ChannelDefaultCharacterModel } from './models-new/index.js';

export class Kobold {
	public db: Kysely<Database>;

	public bestiaryFilesLoaded: BestiaryFilesLoadedModel;
	public channelDefaultCharacter: ChannelDefaultCharacterModel;

	constructor(dialect: PostgresDialect) {
		this.db = new Kysely<Database>({
			dialect,
			plugins: [new CamelCasePlugin({ maintainNestedObjectKeys: true })],
		});
		this.bestiaryFilesLoaded = new BestiaryFilesLoadedModel(this.db);
		this.channelDefaultCharacter = new ChannelDefaultCharacterModel(this.db);
	}
}
