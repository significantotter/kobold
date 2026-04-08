import { PostgresDialect, sql } from 'kysely';
import pg from 'pg';
import _ from 'lodash';
import { Config } from '@kobold/config';
import { fake } from 'zod-schema-faker/v4';
import { faker } from '@faker-js/faker';

// Re-export fake for use in tests (setFaker is called in vitest.setup.ts)
export { fake };

/** Generate a PostgreSQL-safe integer (fits in int4 column) */
export function safeInt(min = 1, max = 2147483647): number {
	return faker.number.int({ min, max });
}

/** Recursively strip undefined values from objects (prevents toMatchObject false negatives with DB defaults) */
export function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
	const result: Record<string, any> = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value === undefined) continue;
		if (Array.isArray(value)) {
			result[key] = value.map(item =>
				item !== null && typeof item === 'object' && !Array.isArray(item)
					? stripUndefined(item)
					: item
			);
		} else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
			result[key] = stripUndefined(value);
		} else {
			result[key] = value;
		}
	}
	return result as Partial<T>;
}

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
	zNewChannelDefaultCharacter,
	zNewCharacter,
	zNewGame,
	zNewGuildDefaultCharacter,
	zNewInitiativeActorGroup,
	zNewInitiativeActor,
	zNewInitiative,
	zNewSheetRecord,
	zNewUserSettings,
	zNewWgAuthToken,
	DefaultCompendiumEnum,
	InitStatsNotificationEnum,
	InlineRollsDisplayEnum,
	RollCompactModeEnum,
	TrackerModeEnum,
	ImportSourceEnum,
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
		const fakeSheetRecordMock = fake(zNewSheetRecord);
		delete fakeSheetRecordMock.id;
		return await vitestKobold.sheetRecord.create({
			...fakeSheetRecordMock,
			...partialSheetRecord,
			trackerMode: (partialSheetRecord?.trackerMode ??
				fakeSheetRecordMock.trackerMode ??
				'counters_only') as TrackerModeEnum,
		});
	}
	public static async character(partialCharacter?: Partial<Character>) {
		const sheetRecordId =
			partialCharacter?.sheetRecordId ?? (await ResourceFactories.sheetRecord()).id;
		const gameId = partialCharacter?.gameId ?? (await ResourceFactories.game()).id;
		const fakeCharacterMock = fake(zNewCharacter);
		delete fakeCharacterMock.id;
		delete fakeCharacterMock.createdAt;
		delete fakeCharacterMock.lastUpdatedAt;
		const { id } = await vitestKobold.character.createReturningId({
			...fakeCharacterMock,
			...partialCharacter,
			sheetRecordId,
			gameId,
			charId: partialCharacter?.charId ?? safeInt(),
			importSource: (partialCharacter?.importSource ?? 'pathbuilder') as ImportSourceEnum,
		});
		const character = await vitestKobold.character.read({ id });
		if (!character) throw new Error(`Failed to read back created character ${id}`);
		return character;
	}
	public static async channelDefaultCharacter(
		partialChannelDefaultCharacter?: Partial<ChannelDefaultCharacter>
	) {
		const characterId =
			partialChannelDefaultCharacter?.characterId ?? (await ResourceFactories.character()).id;
		const fakeChannelDefaultCharacterMock = fake(zNewChannelDefaultCharacter);
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
		const fakeGuildDefaultCharacterMock = fake(zNewGuildDefaultCharacter);
		return await vitestKobold.guildDefaultCharacter.create({
			...fakeGuildDefaultCharacterMock,
			...partialGuildDefaultCharacter,
			characterId,
		});
	}
	public static async game(partialGame?: Partial<Game>) {
		const fakeGameMock = fake(zNewGame);
		delete fakeGameMock.id;
		delete fakeGameMock.createdAt;
		delete fakeGameMock.lastUpdatedAt;
		return await vitestKobold.game.create({
			...fakeGameMock,
			...partialGame,
		});
	}

	public static async initiative(partialInitiative?: Partial<Initiative>) {
		const fakeInitiativeMock = fake(zNewInitiative);
		const currentTurnGroupId = partialInitiative?.currentTurnGroupId ?? null;
		delete fakeInitiativeMock.id;
		delete fakeInitiativeMock.createdAt;
		delete fakeInitiativeMock.lastUpdatedAt;
		return await vitestKobold.initiative.create({
			...fakeInitiativeMock,
			...partialInitiative,
			currentTurnGroupId,
			currentRound: partialInitiative?.currentRound ?? 1,
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
		const fakeInitiativeActorMock = fake(zNewInitiativeActor);
		delete fakeInitiativeActorMock.id;
		delete fakeInitiativeActorMock.createdAt;
		delete fakeInitiativeActorMock.lastUpdatedAt;
		delete fakeInitiativeActorMock.minionId;
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
		const fakeInitiativeActorGroupMock = fake(zNewInitiativeActorGroup);
		delete fakeInitiativeActorGroupMock.id;
		delete fakeInitiativeActorGroupMock.createdAt;
		delete fakeInitiativeActorGroupMock.lastUpdatedAt;
		return await vitestKobold.initiativeActorGroup.create({
			...fakeInitiativeActorGroupMock,
			...partialInitiativeActorGroup,
			initiativeId,
			initiativeResult: partialInitiativeActorGroup?.initiativeResult ?? safeInt(1, 30),
		});
	}
	public static async userSettings(partialUserSettings?: Partial<UserSettings>) {
		const fakeUserSettingsMock = fake(zNewUserSettings);
		return await vitestKobold.userSettings.create({
			...fakeUserSettingsMock,
			...partialUserSettings,
			defaultCompendium:
				partialUserSettings?.defaultCompendium ?? DefaultCompendiumEnum.nethys,
			initStatsNotification:
				partialUserSettings?.initStatsNotification ?? InitStatsNotificationEnum.every_round,
			inlineRollsDisplay:
				partialUserSettings?.inlineRollsDisplay ?? InlineRollsDisplayEnum.detailed,
			rollCompactMode: partialUserSettings?.rollCompactMode ?? RollCompactModeEnum.normal,
		});
	}
	public static async wgAuthToken(partialWgAuthToken?: Partial<WgAuthToken>) {
		const fakeWgAuthTokenMock = fake(zNewWgAuthToken);
		delete fakeWgAuthTokenMock.id;
		return await vitestKobold.wgAuthToken.create({
			...fakeWgAuthTokenMock,
			...partialWgAuthToken,
			charId: partialWgAuthToken?.charId ?? safeInt(),
			expiresAt: partialWgAuthToken?.expiresAt ?? faker.date.future(),
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
