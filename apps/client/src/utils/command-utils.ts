import { CommandInteraction, GuildChannel, ThreadChannel } from 'discord.js';

import { Command } from '../commands/command.js';
import { refs } from '../constants/common-text.js';
import { FormatUtils } from './format-utils.js';
import { InteractionUtils } from './interaction-utils.js';
import { KoboldEmbed } from './kobold-embed-utils.js';
import { StringUtils } from '@kobold/base-utils';

export class CommandUtils {
	public static getSubCommandByName(commands: Command[], input: string): Command | undefined {
		const closestCommandName = StringUtils.findClosestInObjectArray(input, commands, 'name');
		if (!closestCommandName) return undefined;
		return input.trim().toLowerCase() === closestCommandName.name.trim().toLowerCase() ||
			closestCommandName.name.trim().toLowerCase().includes(input.trim().toLowerCase())
			? closestCommandName
			: undefined;
	}
	public static findCommand(commands: Command[], commandParts: string[]): Command | undefined {
		return commands.find(
			command => command.name.trim().toLowerCase() === commandParts[0].trim().toLowerCase()
		);
	}
	public static async runChecks(command: Command, intr: CommandInteraction): Promise<boolean> {
		if (command.cooldown) {
			let limited = command.cooldown.take(intr.user.id);
			if (limited) {
				await InteractionUtils.send(
					intr,
					new KoboldEmbed({
						description: `You can only run this command ${command.cooldown.amount.toLocaleString()} time(s) every ${FormatUtils.duration(
							command.cooldown.interval
						)}. Please wait before attempting this command again.`,
					})
				);
				return false;
			}
		}

		if (
			(intr.channel instanceof GuildChannel || intr.channel instanceof ThreadChannel) &&
			!intr.channel?.permissionsFor?.(intr.client.user)?.has?.(command.requireClientPerms)
		) {
			await InteractionUtils.send(
				intr,
				new KoboldEmbed({
					description: [
						'I don`t have all permissions required to run that command here! Please check the server and channel permissions to make sure I have the following permissions.',
						``,
						`Required permissions: ${command.requireClientPerms
							.map(perm => `**${refs.permissions[perm]}**`)
							.join(', ')}`,
					].join('\n'),
				})
			);
			return false;
		}

		return true;
	}
}
