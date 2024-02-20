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
import _ from 'lodash';

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
			entitlements: [],
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
