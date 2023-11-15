import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin, PostgresDialect } from 'kysely';
import { CharactersInGamesModel } from './models/characters-in-games.model.js';
import {
	ChannelDefaultCharacterModel,
	CharacterModel,
	GameModel,
	GuildDefaultCharacterModel,
	InitiativeActorGroupModel,
	InitiativeActorModel,
	InitiativeModel,
	SheetRecordModel,
	UserSettingsModel,
	WgAuthTokenModel,
} from './models/index.js';
import Database from './schemas/kanel/Database.js';

export class Kobold {
	public db: Kysely<Database>;

	public channelDefaultCharacter: ChannelDefaultCharacterModel;
	public character: CharacterModel;
	public charactersInGames: CharactersInGamesModel;
	public game: GameModel;
	public guildDefaultCharacter: GuildDefaultCharacterModel;
	public initiative: InitiativeModel;
	public initiativeActor: InitiativeActorModel;
	public initiativeActorGroup: InitiativeActorGroupModel;
	public sheetRecord: SheetRecordModel;
	public userSettings: UserSettingsModel;
	public wgAuthToken: WgAuthTokenModel;

	constructor(dialect: PostgresDialect) {
		this.db = new Kysely<Database>({
			dialect,
			plugins: [
				new CamelCasePlugin({ maintainNestedObjectKeys: true }),
				new ParseJSONResultsPlugin(),
			],
		});
		this.channelDefaultCharacter = new ChannelDefaultCharacterModel(this.db);
		this.character = new CharacterModel(this.db);
		this.charactersInGames = new CharactersInGamesModel(this.db);
		this.game = new GameModel(this.db);
		this.guildDefaultCharacter = new GuildDefaultCharacterModel(this.db);
		this.initiative = new InitiativeModel(this.db);
		this.initiativeActor = new InitiativeActorModel(this.db);
		this.initiativeActorGroup = new InitiativeActorGroupModel(this.db);
		this.sheetRecord = new SheetRecordModel(this.db);
		this.userSettings = new UserSettingsModel(this.db);
		this.wgAuthToken = new WgAuthTokenModel(this.db);
	}
}
