import {
	Channel,
	Client,
	DiscordAPIError,
	RESTJSONErrorCodes as DiscordApiErrors,
	Guild,
	GuildMember,
	Locale,
	NewsChannel,
	Role,
	StageChannel,
	TextChannel,
	User,
	VoiceChannel,
} from 'discord.js';

import { PermissionUtils, RegexUtils } from './index.js';

const FETCH_MEMBER_LIMIT = 20;
const channelRegex = /bot|command|cmd/i;

export class ClientUtils {
	public static async getGuild(client: Client, discordId: string): Promise<Guild | undefined> {
		const matchedDiscordId = RegexUtils.discordId(discordId);
		if (!matchedDiscordId) {
			return;
		}

		try {
			return await client.guilds.fetch(matchedDiscordId);
		} catch (error) {
			if (
				error instanceof DiscordAPIError &&
				typeof error.code == 'number' &&
				[DiscordApiErrors.UnknownGuild].includes(error.code)
			) {
				return;
			} else {
				throw error;
			}
		}
	}

	public static async getChannel(
		client: Client,
		discordId: string
	): Promise<Channel | undefined> {
		const matchedDiscordId = RegexUtils.discordId(discordId);
		if (!matchedDiscordId) {
			return;
		}

		try {
			return (await client.channels.fetch(matchedDiscordId)) || undefined;
		} catch (error) {
			if (
				error instanceof DiscordAPIError &&
				typeof error.code == 'number' &&
				[DiscordApiErrors.UnknownChannel].includes(error.code)
			) {
				return;
			} else {
				throw error;
			}
		}
	}

	public static async getUser(client: Client, discordId: string): Promise<User | undefined> {
		const matchedDiscordId = RegexUtils.discordId(discordId);
		if (!matchedDiscordId) {
			return;
		}

		try {
			return await client.users.fetch(matchedDiscordId);
		} catch (error) {
			if (
				error instanceof DiscordAPIError &&
				typeof error.code == 'number' &&
				[DiscordApiErrors.UnknownUser].includes(error.code)
			) {
				return;
			} else {
				throw error;
			}
		}
	}

	public static async findMember(guild: Guild, input: string): Promise<GuildMember | undefined> {
		try {
			const matchedDiscordId = RegexUtils.discordId(input);
			if (matchedDiscordId) {
				return await guild.members.fetch(matchedDiscordId);
			}

			const tag = RegexUtils.tag(input);
			if (tag) {
				return (
					await guild.members.fetch({ query: tag.username, limit: FETCH_MEMBER_LIMIT })
				).find(member => member.user.discriminator === tag.discriminator);
			}

			return (await guild.members.fetch({ query: input, limit: 1 })).first();
		} catch (error) {
			if (
				error instanceof DiscordAPIError &&
				typeof error.code == 'number' &&
				[DiscordApiErrors.UnknownMember, DiscordApiErrors.UnknownUser].includes(error.code)
			) {
				return;
			} else {
				throw error;
			}
		}
	}

	public static async findRole(guild: Guild, input: string): Promise<Role | undefined> {
		try {
			const matchedDiscordId = RegexUtils.discordId(input);
			if (matchedDiscordId) {
				return (await guild.roles.fetch(matchedDiscordId)) || undefined;
			}

			let search = input.trim().toLowerCase().replace(/^@/, '');
			let roles = await guild.roles.fetch();
			return (
				roles.find(role => role.name.toLowerCase() === search) ??
				roles.find(role => role.name.toLowerCase().includes(search))
			);
		} catch (error) {
			if (
				error instanceof DiscordAPIError &&
				typeof error.code == 'number' &&
				[DiscordApiErrors.UnknownRole].includes(error.code)
			) {
				return;
			} else {
				throw error;
			}
		}
	}

	public static async findTextChannel(
		guild: Guild,
		input: string
	): Promise<NewsChannel | TextChannel | undefined> {
		try {
			const matchedDiscordId = RegexUtils.discordId(input);
			if (matchedDiscordId) {
				let channel = await guild.channels.fetch(matchedDiscordId);
				if (channel instanceof NewsChannel || channel instanceof TextChannel) {
					return channel;
				} else {
					return;
				}
			}

			let search = input.trim().toLowerCase().replace(/^#/, '').replaceAll(' ', '-');
			let channels = [...(await guild.channels.fetch()).values()]
				.filter(channel => channel instanceof NewsChannel || channel instanceof TextChannel)
				.map(channel => channel as NewsChannel | TextChannel);
			return (
				channels.find(channel => channel.name.toLowerCase() === search) ??
				channels.find(channel => channel.name.toLowerCase().includes(search))
			);
		} catch (error) {
			if (
				error instanceof DiscordAPIError &&
				typeof error.code == 'number' &&
				[DiscordApiErrors.UnknownChannel].includes(error.code)
			) {
				return;
			} else {
				throw error;
			}
		}
	}

	public static async findVoiceChannel(
		guild: Guild,
		input: string
	): Promise<VoiceChannel | StageChannel | undefined> {
		try {
			const matchedDiscordId = RegexUtils.discordId(input);
			if (matchedDiscordId) {
				let channel = await guild.channels.fetch(matchedDiscordId);
				if (channel instanceof VoiceChannel || channel instanceof StageChannel) {
					return channel;
				} else {
					return;
				}
			}

			let search = input.trim().toLowerCase().replace(/^#/, '');
			let channels = [...(await guild.channels.fetch()).values()]
				.filter(
					channel => channel instanceof VoiceChannel || channel instanceof StageChannel
				)
				.map(channel => channel as VoiceChannel | StageChannel);
			return (
				channels.find(channel => channel.name.toLowerCase() === search) ??
				channels.find(channel => channel.name.toLowerCase().includes(search))
			);
		} catch (error) {
			if (
				error instanceof DiscordAPIError &&
				typeof error.code == 'number' &&
				[DiscordApiErrors.UnknownChannel].includes(error.code)
			) {
				return;
			} else {
				throw error;
			}
		}
	}

	public static async findNotifyChannel(
		guild: Guild,
		langCode: Locale
	): Promise<TextChannel | NewsChannel> {
		// Prefer the system channel
		let systemChannel = guild.systemChannel;
		if (systemChannel && PermissionUtils.canSend(systemChannel, true)) {
			return systemChannel;
		}

		// Otherwise look for a bot channel
		return (await guild.channels.fetch()).find(
			channel =>
				(channel instanceof TextChannel || channel instanceof NewsChannel) &&
				PermissionUtils.canSend(channel, true) &&
				channelRegex.test(channel.name)
		) as TextChannel | NewsChannel;
	}
}
