import { type default as KyselyMigrationTable } from './KyselyMigration.js';
import { type default as KyselyMigrationLockTable } from './KyselyMigrationLock.js';
import { type default as SheetRecordTable } from './SheetRecord.js';
import { type default as ChannelDefaultCharacterTable } from './ChannelDefaultCharacter.js';
import { type default as CharacterTable } from './Character.js';
import { type default as CharactersInGamesTable } from './CharactersInGames.js';
import { type default as GameTable } from './Game.js';
import { type default as GuildDefaultCharacterTable } from './GuildDefaultCharacter.js';
import { type default as InitiativeTable } from './Initiative.js';
import { type default as InitiativeActorTable } from './InitiativeActor.js';
import { type default as InitiativeActorGroupTable } from './InitiativeActorGroup.js';
import { type default as KnexMigrationsTable } from './KnexMigrations.js';
import { type default as KnexMigrationsLockTable } from './KnexMigrationsLock.js';
import { type default as UserSettingsTable } from './UserSettings.js';
import { type default as WgAuthTokenTable } from './WgAuthToken.js';

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