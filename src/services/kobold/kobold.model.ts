import { CamelCasePlugin, Kysely, ParseJSONResultsPlugin, PostgresDialect } from 'kysely';
import Database from './schemas/kanel/Database.js';
import {
	BestiaryFilesLoadedModel,
	ChannelDefaultCharacterModel,
	CharacterModel,
	GameModel,
	GuildDefaultCharacterModel,
	InitiativeActorGroupModel,
	InitiativeActorModel,
	InitiativeModel,
	NpcModel,
	UserSettingsModel,
	WgAuthTokenModel,
} from './models/index.js';
import { CharactersInGamesModel } from './models/characters-in-games.model.js';

export class Kobold {
	public db: Kysely<Database>;

	public bestiaryFilesLoaded: BestiaryFilesLoadedModel;
	public channelDefaultCharacter: ChannelDefaultCharacterModel;
	public character: CharacterModel;
	public charactersInGames: CharactersInGamesModel;
	public game: GameModel;
	public guildDefaultCharacter: GuildDefaultCharacterModel;
	public initiative: InitiativeModel;
	public initiativeActor: InitiativeActorModel;
	public initiativeActorGroup: InitiativeActorGroupModel;
	public npc: NpcModel;
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
		this.bestiaryFilesLoaded = new BestiaryFilesLoadedModel(this.db);
		this.channelDefaultCharacter = new ChannelDefaultCharacterModel(this.db);
		this.character = new CharacterModel(this.db);
		this.charactersInGames = new CharactersInGamesModel(this.db);
		this.game = new GameModel(this.db);
		this.guildDefaultCharacter = new GuildDefaultCharacterModel(this.db);
		this.initiative = new InitiativeModel(this.db);
		this.initiativeActor = new InitiativeActorModel(this.db);
		this.initiativeActorGroup = new InitiativeActorGroupModel(this.db);
		this.npc = new NpcModel(this.db);
		this.userSettings = new UserSettingsModel(this.db);
		this.wgAuthToken = new WgAuthTokenModel(this.db);
	}
}
