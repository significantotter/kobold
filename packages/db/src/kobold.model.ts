import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin, PostgresDialect } from 'kysely';
import {
	ChannelDefaultCharacterModel,
	CharacterModel,
	GameModel,
	GuildDefaultCharacterModel,
	InitiativeActorGroupModel,
	InitiativeActorModel,
	InitiativeModel,
	MinionModel,
	ModifierModel,
	SheetRecordModel,
	UserSettingsModel,
	WgAuthTokenModel,
} from './models/index.js';
import { ActionModel, Database, RollMacroModel } from './index.js';

export class Kobold {
	public db: Kysely<Database>;

	public action: ActionModel;
	public channelDefaultCharacter: ChannelDefaultCharacterModel;
	public character: CharacterModel;
	public game: GameModel;
	public guildDefaultCharacter: GuildDefaultCharacterModel;
	public initiative: InitiativeModel;
	public initiativeActor: InitiativeActorModel;
	public initiativeActorGroup: InitiativeActorGroupModel;
	public minion: MinionModel;
	public modifier: ModifierModel;
	public rollMacro: RollMacroModel;
	public sheetRecord: SheetRecordModel;
	public userSettings: UserSettingsModel;
	public wgAuthToken: WgAuthTokenModel;

	constructor(dialectOrDb: PostgresDialect | Kysely<Database>) {
		if (dialectOrDb instanceof Kysely) {
			this.db = dialectOrDb;
		} else {
			this.db = new Kysely<Database>({
				dialect: dialectOrDb,
				plugins: [new ParseJSONResultsPlugin(), new CamelCasePlugin()],
			});
		}
		this.action = new ActionModel(this.db);
		this.channelDefaultCharacter = new ChannelDefaultCharacterModel(this.db);
		this.character = new CharacterModel(this.db);
		this.game = new GameModel(this.db);
		this.guildDefaultCharacter = new GuildDefaultCharacterModel(this.db);
		this.initiative = new InitiativeModel(this.db);
		this.initiativeActor = new InitiativeActorModel(this.db);
		this.initiativeActorGroup = new InitiativeActorGroupModel(this.db);
		this.minion = new MinionModel(this.db);
		this.modifier = new ModifierModel(this.db);
		this.rollMacro = new RollMacroModel(this.db);
		this.sheetRecord = new SheetRecordModel(this.db);
		this.userSettings = new UserSettingsModel(this.db);
		this.wgAuthToken = new WgAuthTokenModel(this.db);
	}

	/**
	 * Executes a callback inside a database transaction.
	 * A transaction-scoped Kobold instance is passed to the callback,
	 * ensuring all DB operations within are atomic.
	 */
	async transaction<T>(fn: (kobold: Kobold) => Promise<T>): Promise<T> {
		return this.db.transaction().execute(async trx => {
			return fn(new Kobold(trx));
		});
	}
}
