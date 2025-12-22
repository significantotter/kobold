import { PostgresDialect, sql } from 'kysely';
import pg from 'pg';
import _ from 'lodash';
import { Config } from '@kobold/config';
import { fake } from 'zod-schema-faker/v4';

// Re-export fake for use in tests (setFaker is called in vitest.setup.ts)
export { fake };

import {
	ChannelDefaultCharacter,
	Character,
	Game,
	GuildDefaultCharacter,
	Initiative,
	InitiativeActor,
	InitiativeActorGroup,
	Kobold,
	SheetRecord,
	UserSettings,
	WgAuthToken,
	zChannelDefaultCharacterInitializer,
	zCharacterInitializer,
	zGameInitializer,
	zGuildDefaultCharacterInitializer,
	zInitiativeActorGroupInitializer,
	zInitiativeActorInitializer,
	zInitiativeInitializer,
	zSheetRecordInitializer,
	zUserSettingsInitializer,
	zWgAuthTokenInitializer,
} from './index.js';
import { format } from 'date-fns';

function parseDate(val: string | null): string | null {
	if (val === null) return null;
	return format(new Date(val), 'YYYY-MM-DD');
}

pg.types.setTypeParser(pg.types.builtins.DATE, val => parseDate(val));
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, val => new Date(val));
pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, val => new Date(val));
pg.types.setTypeParser(pg.types.builtins.NUMERIC, val => parseFloat(val));

// Convert bitInts to js number
pg.types.setTypeParser(pg.types.builtins.INT8, parseInt);

export function getDialect(databaseUrl: string) {
	return new PostgresDialect({
		pool: new pg.Pool({ connectionString: databaseUrl }),
	});
}

const postgresDialect = await getDialect(Config.database.testUrl);
export const vitestKobold: Kobold = new Kobold(postgresDialect);

export class ResourceFactories {
	public static async sheetRecord(partialSheetRecord?: Partial<SheetRecord>) {
		const fakeSheetRecordMock = fake(zSheetRecordInitializer);
		delete fakeSheetRecordMock.id;
		return await vitestKobold.sheetRecord.create({
			...fakeSheetRecordMock,
			...partialSheetRecord,
		});
	}
	public static async character(partialCharacter?: Partial<Character>) {
		const sheetRecordId =
			partialCharacter?.sheetRecordId ?? (await ResourceFactories.sheetRecord()).id;
		const gameId = partialCharacter?.gameId ?? (await ResourceFactories.game()).id;
		const fakeCharacterMock = fake(zCharacterInitializer);
		delete fakeCharacterMock.id;
		delete fakeCharacterMock.createdAt;
		delete fakeCharacterMock.lastUpdatedAt;
		return await vitestKobold.character.create({
			...fakeCharacterMock,
			...partialCharacter,
			sheetRecordId,
			gameId,
		});
	}
	public static async channelDefaultCharacter(
		partialChannelDefaultCharacter?: Partial<ChannelDefaultCharacter>
	) {
		const characterId =
			partialChannelDefaultCharacter?.characterId ?? (await ResourceFactories.character()).id;
		const fakeChannelDefaultCharacterMock = fake(zChannelDefaultCharacterInitializer);
		return await vitestKobold.channelDefaultCharacter.create({
			...fakeChannelDefaultCharacterMock,
			...partialChannelDefaultCharacter,
			characterId,
		});
	}
	public static async guildDefaultCharacter(
		partialGuildDefaultCharacter?: Partial<GuildDefaultCharacter>
	) {
		const characterId =
			partialGuildDefaultCharacter?.characterId ?? (await ResourceFactories.character()).id;
		const fakeGuildDefaultCharacterMock = fake(zGuildDefaultCharacterInitializer);
		return await vitestKobold.guildDefaultCharacter.create({
			...fakeGuildDefaultCharacterMock,
			...partialGuildDefaultCharacter,
			characterId,
		});
	}
	public static async game(partialGame?: Partial<Game>) {
		const fakeGameMock = fake(zGameInitializer);
		delete fakeGameMock.id;
		delete fakeGameMock.createdAt;
		delete fakeGameMock.lastUpdatedAt;
		return await vitestKobold.game.create({
			...fakeGameMock,
			...partialGame,
		});
	}

	public static async initiative(partialInitiative?: Partial<Initiative>) {
		const fakeInitiativeMock = fake(zInitiativeInitializer);
		const currentTurnGroupId = partialInitiative?.currentTurnGroupId ?? null;
		delete fakeInitiativeMock.id;
		return await vitestKobold.initiative.create({
			...fakeInitiativeMock,
			...partialInitiative,
			currentTurnGroupId,
		});
	}

	public static async initiativeActor(partialInitiativeActor?: Partial<InitiativeActor>) {
		const initiativeId =
			partialInitiativeActor?.initiativeId ?? (await ResourceFactories.initiative()).id;
		const gameId = partialInitiativeActor?.gameId ?? (await ResourceFactories.game()).id;
		const initiativeActorGroupId =
			partialInitiativeActor?.initiativeActorGroupId ??
			(await ResourceFactories.initiativeActorGroup({ initiativeId: initiativeId })).id;
		const characterId = partialInitiativeActor?.characterId ?? null;
		const sheetRecordId =
			partialInitiativeActor?.sheetRecordId ?? (await ResourceFactories.sheetRecord()).id;
		const fakeInitiativeActorMock = fake(zInitiativeActorInitializer);
		delete fakeInitiativeActorMock.id;
		return await vitestKobold.initiativeActor.create({
			...fakeInitiativeActorMock,
			...partialInitiativeActor,
			initiativeId,
			initiativeActorGroupId,
			characterId,
			sheetRecordId,
			gameId,
		});
	}

	public static async initiativeActorGroup(
		partialInitiativeActorGroup?: Partial<InitiativeActorGroup>
	) {
		const initiativeId =
			partialInitiativeActorGroup?.initiativeId ?? (await ResourceFactories.initiative()).id;
		const fakeInitiativeActorGroupMock = fake(zInitiativeActorGroupInitializer);
		delete fakeInitiativeActorGroupMock.id;
		return await vitestKobold.initiativeActorGroup.create({
			...fakeInitiativeActorGroupMock,
			...partialInitiativeActorGroup,
			initiativeId,
		});
	}
	public static async userSettings(partialUserSettings?: Partial<UserSettings>) {
		const fakeUserSettingsMock = fake(zUserSettingsInitializer);
		return await vitestKobold.userSettings.create({
			...fakeUserSettingsMock,
			...partialUserSettings,
		});
	}
	public static async wgAuthToken(partialWgAuthToken?: Partial<WgAuthToken>) {
		const fakeWgAuthTokenMock = fake(zWgAuthTokenInitializer);
		return await vitestKobold.wgAuthToken.create({
			...fakeWgAuthTokenMock,
			...partialWgAuthToken,
		});
	}
}

export function truncateDbForTests() {
	return vitestKobold.db.executeQuery(
		sql`
			TRUNCATE "channel_default_character" CASCADE;
			TRUNCATE "character" CASCADE;
			ALTER SEQUENCE "character_id_seq" RESTART WITH 1;
			TRUNCATE "game" CASCADE;
			TRUNCATE "guild_default_character" CASCADE;
			TRUNCATE "initiative_actor_group" CASCADE;
			TRUNCATE "initiative_actor" CASCADE;
			TRUNCATE "initiative" CASCADE;
			TRUNCATE "sheet_record" CASCADE;
			TRUNCATE "user_settings" CASCADE;
			TRUNCATE "wg_auth_token" CASCADE;
		`.compile(vitestKobold.db)
	);
}
