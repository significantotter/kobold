import { faker } from '@faker-js/faker';
import {
	ApplicationCommandType,
	ChannelType,
	ChatInputCommandInteraction,
	Client,
	ClientOptions,
	CommandInteractionOptionResolver,
	GuildMemberFlags,
	PermissionsBitField,
} from 'discord.js';
import { sql } from 'kysely';
import _ from 'lodash';
import { Config } from '../config/config.js';
import { getDialect } from '../services/db.dialect.js';
import { Kobold } from '../services/kobold/kobold.model.js';
import { generateMock } from '@anatine/zod-mock';
import {
	ChannelDefaultCharacter,
	Character,
	CharactersInGames,
	Game,
	GuildDefaultCharacter,
	Initiative,
	InitiativeActor,
	InitiativeActorGroup,
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
} from '../services/kobold/index.js';

const postgresDialect = await getDialect(Config.database.testUrl);
export const vitestKobold: Kobold = new Kobold(postgresDialect);

export class ResourceFactories {
	public static async sheetRecord(partialSheetRecord?: Partial<SheetRecord>) {
		const fakeSheetRecordMock = generateMock(zSheetRecordInitializer);
		delete fakeSheetRecordMock.id;
		return await vitestKobold.sheetRecord.create({
			...fakeSheetRecordMock,
			...partialSheetRecord,
		});
	}
	public static async character(partialCharacter?: Partial<Character>) {
		const sheetRecordId =
			partialCharacter?.sheetRecordId ?? (await ResourceFactories.sheetRecord()).id;
		const fakeCharacterMock = generateMock(zCharacterInitializer);
		delete fakeCharacterMock.id;
		delete fakeCharacterMock.createdAt;
		delete fakeCharacterMock.lastUpdatedAt;
		return await vitestKobold.character.create({
			...fakeCharacterMock,
			...partialCharacter,
			sheetRecordId,
		});
	}
	public static async channelDefaultCharacter(
		partialChannelDefaultCharacter?: Partial<ChannelDefaultCharacter>
	) {
		const characterId =
			partialChannelDefaultCharacter?.characterId ?? (await ResourceFactories.character()).id;
		const fakeChannelDefaultCharacterMock = generateMock(
			zChannelDefaultCharacterInitializer,
			{}
		);
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
		const fakeGuildDefaultCharacterMock = generateMock(zGuildDefaultCharacterInitializer, {});
		return await vitestKobold.guildDefaultCharacter.create({
			...fakeGuildDefaultCharacterMock,
			...partialGuildDefaultCharacter,
			characterId,
		});
	}
	public static async game(partialGame?: Partial<Game>) {
		const fakeGameMock = generateMock(zGameInitializer);
		delete fakeGameMock.id;
		delete fakeGameMock.createdAt;
		delete fakeGameMock.lastUpdatedAt;
		return await vitestKobold.game.create({
			...fakeGameMock,
			...partialGame,
		});
	}
	public static async charactersInGames(partialCharactersInGames?: Partial<CharactersInGames>) {
		const gameId = partialCharactersInGames?.gameId ?? (await ResourceFactories.game()).id;
		const characterId =
			partialCharactersInGames?.characterId ?? (await ResourceFactories.character()).id;
		return await vitestKobold.charactersInGames.create({
			...partialCharactersInGames,
			gameId,
			characterId,
		});
	}

	public static async initiative(partialInitiative?: Partial<Initiative>) {
		const fakeInitiativeMock = generateMock(zInitiativeInitializer);
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
		const initiativeActorGroupId =
			partialInitiativeActor?.initiativeActorGroupId ??
			(await ResourceFactories.initiativeActorGroup({ initiativeId: initiativeId })).id;
		const characterId = partialInitiativeActor?.characterId ?? null;
		const sheetRecordId =
			partialInitiativeActor?.sheetRecordId ?? (await ResourceFactories.sheetRecord()).id;
		const fakeInitiativeActorMock = generateMock(zInitiativeActorInitializer);
		delete fakeInitiativeActorMock.id;
		return await vitestKobold.initiativeActor.create({
			...fakeInitiativeActorMock,
			...partialInitiativeActor,
			initiativeId,
			initiativeActorGroupId,
			characterId,
			sheetRecordId,
		});
	}

	public static async initiativeActorGroup(
		partialInitiativeActorGroup?: Partial<InitiativeActorGroup>
	) {
		const initiativeId =
			partialInitiativeActorGroup?.initiativeId ?? (await ResourceFactories.initiative()).id;
		const fakeInitiativeActorGroupMock = generateMock(zInitiativeActorGroupInitializer);
		delete fakeInitiativeActorGroupMock.id;
		return await vitestKobold.initiativeActorGroup.create({
			...fakeInitiativeActorGroupMock,
			...partialInitiativeActorGroup,
			initiativeId,
		});
	}
	public static async userSettings(partialUserSettings?: Partial<UserSettings>) {
		const fakeUserSettingsMock = generateMock(zUserSettingsInitializer);
		return await vitestKobold.userSettings.create({
			...fakeUserSettingsMock,
			...partialUserSettings,
		});
	}
	public static async wgAuthToken(partialWgAuthToken?: Partial<WgAuthToken>) {
		const fakeWgAuthTokenMock = generateMock(zWgAuthTokenInitializer);
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
			TRUNCATE "characters_in_games" CASCADE;
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

export class MockChatInputCommandInteraction extends ChatInputCommandInteraction {
	constructor(mockOptions?: { optionResults?: { [k: string]: any } }) {
		const options: ClientOptions = {
			intents: [
				'Guilds',
				'GuildMessages',
				'GuildEmojisAndStickers',
				'GuildMessageReactions',
				'DirectMessages',
				'DirectMessageReactions',
			],
		};
		const mockClient = new Client(options) as Client<true>; // Create a mock Client instance

		super(mockClient, {
			id: 'interactionId',
			application_id: 'applicationId',
			type: 2, // Type 2 is APPLICATION_COMMAND
			locale: 'en-US',
			channel: {
				id: 'channelId',
				type: ChannelType.GuildText,
				guild_id: 'guildId',
			},
			app_permissions: '',
			data: {
				id: 'commandId',
				type: ApplicationCommandType.ChatInput,
				name: 'commandName',
				options: [],
			},
			guild_id: 'guildId',
			channel_id: 'channelId',
			member: {
				user: {
					id: 'userId',
					global_name: 'username',
					username: 'username',
					discriminator: 'discriminator',
					avatar: 'avatar',
				},
				roles: [],
				premium_since: null,
				permissions: PermissionsBitField.All.toString(),
				pending: false,
				nick: null,
				mute: false,
				joined_at: new Date().toISOString(),
				deaf: false,
				flags: _.sum(Object.values(GuildMemberFlags)),
			},
			token: 'token',
			version: 1,
		});

		// Mock CommandInteractionOptionResolver
		this.options = {
			getString: vitest.fn(val => mockOptions?.optionResults?.[val] ?? faker.word.words()),
			getInteger: vitest.fn(val => mockOptions?.optionResults?.[val] ?? faker.number.int()),
			getBoolean: vitest.fn(
				val => mockOptions?.optionResults?.[val] ?? faker.datatype.boolean()
			),
		} as unknown as CommandInteractionOptionResolver;
	}
}
