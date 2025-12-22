import { faker } from '@faker-js/faker';
import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChannelType,
	ChatInputCommandInteraction,
	Client,
	ClientOptions,
	CommandInteractionOptionResolver,
	GuildMemberFlags,
	Locale,
	PermissionsBitField,
} from 'discord.js';
import _ from 'lodash';
import { vi, Mock } from 'vitest';

export interface MockInteractionOptions {
	commandName?: string;
	subcommand?: string;
	subcommandGroup?: string;
	options?: Record<string, any>;
	userId?: string;
	guildId?: string;
	channelId?: string;
}

// Helper class to access protected constructor
class TestChatInputCommandInteraction extends ChatInputCommandInteraction<CacheType> {
	constructor(client: Client<true>, data: any) {
		super(client, data);
	}
}

class TestAutocompleteInteraction extends AutocompleteInteraction<CacheType> {
	constructor(client: Client<true>, data: any) {
		super(client, data);
	}
}

/**
 * Creates a mock ChatInputCommandInteraction for integration testing commands.
 * This mock includes all necessary properties and methods to simulate a real Discord interaction.
 */
export function createMockChatInputInteraction(
	options: MockInteractionOptions = {}
): ChatInputCommandInteraction<CacheType> & {
	reply: Mock;
	editReply: Mock;
	followUp: Mock;
	deferReply: Mock;
} {
	const {
		commandName = 'test-command',
		subcommand,
		subcommandGroup,
		options: interactionOptions = {},
		userId = faker.string.numeric(18),
		guildId = faker.string.numeric(18),
		channelId = faker.string.numeric(18),
	} = options;

	const clientOptions: ClientOptions = {
		intents: [
			'Guilds',
			'GuildMessages',
			'GuildEmojisAndStickers',
			'GuildMessageReactions',
			'DirectMessages',
			'DirectMessageReactions',
		],
	};

	const mockClient = new Client(clientOptions) as Client<true>;

	const interaction = new TestChatInputCommandInteraction(mockClient, {
		id: faker.string.numeric(18),
		application_id: faker.string.numeric(18),
		type: 2, // APPLICATION_COMMAND
		locale: Locale.EnglishUS,
		attachment_size_limit: 8388608,
		entitlements: [],
		channel: {
			id: channelId,
			type: ChannelType.GuildText,
			guild_id: guildId,
		},
		authorizing_integration_owners: {},
		app_permissions: PermissionsBitField.All.toString(),
		data: {
			id: faker.string.numeric(18),
			type: ApplicationCommandType.ChatInput,
			name: commandName,
			options: [],
		},
		guild_id: guildId,
		channel_id: channelId,
		member: {
			user: {
				id: userId,
				global_name: faker.internet.username(),
				username: faker.internet.username(),
				discriminator: '0001',
				avatar: faker.string.alphanumeric(32),
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
		token: faker.string.alphanumeric(68),
		version: 1,
	});

	// Mock the options resolver with the provided options
	const mockOptionsResolver = {
		getSubcommand: vi.fn((required?: boolean) => subcommand ?? (required ? '' : null)),
		getSubcommandGroup: vi.fn(() => subcommandGroup ?? null),
		getString: vi.fn((name: string, required?: boolean) => {
			const value = interactionOptions[name];
			if (value !== undefined) return String(value);
			return required ? '' : null;
		}),
		getInteger: vi.fn((name: string, required?: boolean) => {
			const value = interactionOptions[name];
			if (value !== undefined) return Number(value);
			return required ? 0 : null;
		}),
		getNumber: vi.fn((name: string, required?: boolean) => {
			const value = interactionOptions[name];
			if (value !== undefined) return Number(value);
			return required ? 0 : null;
		}),
		getBoolean: vi.fn((name: string, required?: boolean) => {
			const value = interactionOptions[name];
			if (value !== undefined) return Boolean(value);
			return required ? false : null;
		}),
		getUser: vi.fn(() => null),
		getMember: vi.fn(() => null),
		getChannel: vi.fn(() => null),
		getRole: vi.fn(() => null),
		getMentionable: vi.fn(() => null),
		getAttachment: vi.fn(() => null),
		getFocused: vi.fn(() => ({ name: '', value: '' })),
		get: vi.fn((name: string) => interactionOptions[name] ?? null),
		data: [],
	} as unknown as CommandInteractionOptionResolver<CacheType>;

	(interaction as any).options = mockOptionsResolver;

	// Mock reply methods
	const mockReply = vi.fn(async () => {
		id: faker.string.numeric(18);
	});
	const mockEditReply = vi.fn(async () => {
		id: faker.string.numeric(18);
	});
	const mockFollowUp = vi.fn(async () => {
		id: faker.string.numeric(18);
	});
	const mockDeferReply = vi.fn(async () => {
		(interaction as any).deferred = true;
		return { id: faker.string.numeric(18) };
	});

	(interaction as any).reply = mockReply;
	(interaction as any).editReply = mockEditReply;
	(interaction as any).followUp = mockFollowUp;
	(interaction as any).deferReply = mockDeferReply;
	(interaction as any).deferred = false;
	(interaction as any).replied = false;

	// Add guild object with id for commands that use intr.guild?.id
	// Use Object.defineProperty since guild is a getter in BaseInteraction
	Object.defineProperty(interaction, 'guild', {
		value: { id: guildId },
		writable: true,
		configurable: true,
	});

	return interaction as ChatInputCommandInteraction<CacheType> & {
		reply: Mock;
		editReply: Mock;
		followUp: Mock;
		deferReply: Mock;
	};
}

/**
 * Creates a mock AutocompleteInteraction for testing autocomplete handlers.
 */
export function createMockAutocompleteInteraction(
	options: MockInteractionOptions & {
		focusedOption?: { name: string; value: string };
	} = {}
): AutocompleteInteraction<CacheType> & { respond: Mock } {
	const {
		commandName = 'test-command',
		subcommand,
		subcommandGroup,
		options: interactionOptions = {},
		userId = faker.string.numeric(18),
		guildId = faker.string.numeric(18),
		channelId = faker.string.numeric(18),
		focusedOption = { name: 'query', value: '' },
	} = options;

	const clientOptions: ClientOptions = {
		intents: [
			'Guilds',
			'GuildMessages',
			'GuildEmojisAndStickers',
			'GuildMessageReactions',
			'DirectMessages',
			'DirectMessageReactions',
		],
	};

	const mockClient = new Client(clientOptions) as Client<true>;

	const interaction = new TestAutocompleteInteraction(mockClient, {
		id: faker.string.numeric(18),
		application_id: faker.string.numeric(18),
		type: 4, // APPLICATION_COMMAND_AUTOCOMPLETE
		locale: Locale.EnglishUS,
		attachment_size_limit: 8388608,
		entitlements: [],
		channel: {
			id: channelId,
			type: ChannelType.GuildText,
			guild_id: guildId,
		},
		authorizing_integration_owners: {},
		app_permissions: PermissionsBitField.All.toString(),
		data: {
			id: faker.string.numeric(18),
			type: ApplicationCommandType.ChatInput,
			name: commandName,
			options: [],
		},
		guild_id: guildId,
		channel_id: channelId,
		member: {
			user: {
				id: userId,
				global_name: faker.internet.username(),
				username: faker.internet.username(),
				discriminator: '0001',
				avatar: faker.string.alphanumeric(32),
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
		token: faker.string.alphanumeric(68),
		version: 1,
	});

	// Mock the options resolver
	const mockOptionsResolver = {
		getSubcommand: vi.fn((required?: boolean) => subcommand ?? (required ? '' : null)),
		getSubcommandGroup: vi.fn(() => subcommandGroup ?? null),
		getString: vi.fn((name: string) => interactionOptions[name] ?? null),
		getInteger: vi.fn((name: string) => interactionOptions[name] ?? null),
		getNumber: vi.fn((name: string) => interactionOptions[name] ?? null),
		getBoolean: vi.fn((name: string) => interactionOptions[name] ?? null),
		getFocused: vi.fn((full?: boolean): string | AutocompleteFocusedOption =>
			full ? (focusedOption as AutocompleteFocusedOption) : focusedOption.value
		),
		data: [],
	} as unknown as CommandInteractionOptionResolver<CacheType>;

	(interaction as any).options = mockOptionsResolver;

	// Mock respond method
	const mockRespond = vi.fn(async () => undefined);
	(interaction as any).respond = mockRespond;

	return interaction as AutocompleteInteraction<CacheType> & { respond: Mock };
}

/**
 * Helper to extract the content from interaction reply/editReply calls.
 * Handles both string content and embed objects.
 */
export function getInteractionResponseContent(interaction: {
	reply: Mock;
	editReply: Mock;
	followUp: Mock;
}): string | undefined {
	// Check editReply first (most common for deferred interactions)
	if (interaction.editReply.mock.calls.length > 0) {
		const call = interaction.editReply.mock.calls[0][0];
		if (typeof call === 'string') return call;
		if (call?.content) return call.content;
		if (call?.embeds?.[0]?.data?.description) return call.embeds[0].data.description;
	}

	// Check reply
	if (interaction.reply.mock.calls.length > 0) {
		const call = interaction.reply.mock.calls[0][0];
		if (typeof call === 'string') return call;
		if (call?.content) return call.content;
		if (call?.embeds?.[0]?.data?.description) return call.embeds[0].data.description;
	}

	// Check followUp
	if (interaction.followUp.mock.calls.length > 0) {
		const call = interaction.followUp.mock.calls[0][0];
		if (typeof call === 'string') return call;
		if (call?.content) return call.content;
		if (call?.embeds?.[0]?.data?.description) return call.embeds[0].data.description;
	}

	return undefined;
}

/**
 * Helper to extract ALL content from interaction responses, including embed fields.
 * Use this for commands that use KoboldEmbed.addFields() like game-list.
 * Combines content from reply, followUp, and editReply calls.
 */
export function getFullEmbedContent(interaction: {
	reply?: { mock: { calls: any[][] } };
	followUp?: { mock: { calls: any[][] } };
	editReply?: { mock: { calls: any[][] } };
}): string {
	const replyCalls = interaction.reply?.mock?.calls || [];
	const followUpCalls = interaction.followUp?.mock?.calls || [];
	const editReplyCalls = interaction.editReply?.mock?.calls || [];

	// Combine all calls to get all content
	const allCalls = [...replyCalls, ...followUpCalls, ...editReplyCalls];
	if (allCalls.length === 0) return '';

	let content = '';
	for (const callArgs of allCalls) {
		const call = callArgs[0];
		if (typeof call === 'string') {
			content += call + '\n';
			continue;
		}
		if (call?.content) content += call.content + '\n';
		if (call?.embeds) {
			for (const embed of call.embeds) {
				if (embed.data?.title) content += embed.data.title + '\n';
				if (embed.data?.description) content += embed.data.description + '\n';
				if (embed.data?.fields) {
					for (const field of embed.data.fields) {
						if (field.name) content += field.name + '\n';
						if (field.value) content += field.value + '\n';
					}
				}
			}
		}
	}
	return content;
}
