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
import { zCharacterInitializer, zSheetRecordInitializer } from '../services/kobold/index.js';

const postgresDialect = await getDialect(Config.database.testUrl);
export const vitestKobold: Kobold = new Kobold(postgresDialect);

export class resourceFactories {
	public static async sheetRecord() {
		const fakeSheetRecordMock = generateMock(zSheetRecordInitializer);
		return await vitestKobold.sheetRecord.create(fakeSheetRecordMock);
	}
	public static async character() {
		const sheetRecord = await resourceFactories.sheetRecord();
		const fakeCharacterMock = generateMock(zCharacterInitializer, {});
		vitestKobold.character.create(fakeCharacterMock);
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
		const mockClient = new Client(options); // Create a mock Client instance

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
