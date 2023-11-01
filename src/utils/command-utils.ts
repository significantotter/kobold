import { CommandInteraction, GuildChannel, ThreadChannel } from 'discord.js';

import { Command } from '../commands/command.js';
import { FormatUtils } from './format-utils.js';
import { KoboldEmbed } from './kobold-embed-utils.js';
import { refs } from '../constants/common-text.js';
import { InteractionUtils } from './interaction-utils.js';

export class CommandUtils {
	public static getSubCommandByName(commands: Command[], input: string): Command | undefined {
		return commands.find(command => command.names.includes(input));
	}
	public static findCommand(commands: Command[], commandParts: string[]): Command | undefined {
		let found = [...commands];
		let closestMatch: Command | undefined = undefined;
		for (let [index, commandPart] of commandParts.entries()) {
			found = found.filter(command => command.names[index] === commandPart);
			if (found.length === 0) {
				return closestMatch;
			}

			if (found.length === 1) {
				return found[0];
			}

			let exactMatch = found.find(command => command.names.length === index + 1);
			if (exactMatch) {
				closestMatch = exactMatch;
			}
		}
		return closestMatch;
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
