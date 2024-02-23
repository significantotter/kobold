import { Guild } from 'discord.js';
import { intervalToDuration, formatDuration } from 'date-fns';

export class FormatUtils {
	public static roleMention(guild: Guild, discordId: string): string {
		if (discordId === '@here') {
			return discordId;
		}

		if (discordId === guild.id) {
			return '@everyone';
		}

		return `<@&${discordId}>`;
	}

	public static channelMention(discordId: string): string {
		return `<#${discordId}>`;
	}

	public static userMention(discordId: string): string {
		return `<@!${discordId}>`;
	}

	public static duration(milliseconds: number): string {
		return formatDuration(intervalToDuration({ start: 0, end: milliseconds }));
	}
}
