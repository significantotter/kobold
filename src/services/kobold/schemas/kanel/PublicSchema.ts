import type KyselyMigrationTable from './KyselyMigration.js';
import type KyselyMigrationLockTable from './KyselyMigrationLock.js';
import type SheetRecordTable from './SheetRecord.js';
import type ChannelDefaultCharacterTable from './ChannelDefaultCharacter.js';
import type CharacterTable from './Character.js';
import type CharactersInGamesTable from './CharactersInGames.js';
import type GameTable from './Game.js';
import type GuildDefaultCharacterTable from './GuildDefaultCharacter.js';
import type InitiativeTable from './Initiative.js';
import type InitiativeActorTable from './InitiativeActor.js';
import type InitiativeActorGroupTable from './InitiativeActorGroup.js';
import type KnexMigrationsTable from './KnexMigrations.js';
import type KnexMigrationsLockTable from './KnexMigrationsLock.js';
import type UserSettingsTable from './UserSettings.js';
import type WgAuthTokenTable from './WgAuthToken.js';

export default interface PublicSchema {
  kyselyMigration: KyselyMigrationTable;

  kyselyMigrationLock: KyselyMigrationLockTable;

  sheetRecord: SheetRecordTable;

  channelDefaultCharacter: ChannelDefaultCharacterTable;

  character: CharacterTable;

  charactersInGames: CharactersInGamesTable;

  game: GameTable;

  guildDefaultCharacter: GuildDefaultCharacterTable;

  initiative: InitiativeTable;

  initiativeActor: InitiativeActorTable;

  initiativeActorGroup: InitiativeActorGroupTable;

  knexMigrations: KnexMigrationsTable;

  knexMigrationsLock: KnexMigrationsLockTable;

  userSettings: UserSettingsTable;

  wgAuthToken: WgAuthTokenTable;
}