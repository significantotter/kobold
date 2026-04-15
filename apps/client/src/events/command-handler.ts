import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	CommandInteraction,
	CommandInteractionOption,
	NewsChannel,
	TextChannel,
	ThreadChannel,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { Command, CommandDeferType } from '../commands/index.js';
import { DiscordLimits } from '../constants/index.js';
import { Logger } from '../services/index.js';
import { CommandUtils, InteractionUtils } from '../utils/index.js';
import { EventHandler } from './event-handler.js';
import { Config } from '@kobold/config';
import { KoboldEmbed } from '../utils/kobold-embed-utils.js';
import { refs } from '../constants/common-text.js';
import { KoboldError } from '../utils/KoboldError.js';
import { filterNotNullOrUndefined } from '../utils/type-guards.js';
import { InjectedServices } from '../commands/command.js';

export class CommandHandler implements EventHandler {
	protected rateLimiter = new RateLimiter(
		Config.rateLimiting.commands.amount,
		Config.rateLimiting.commands.interval * 1000
	);

	constructor(
		public commands: Command[],
		public injectedServices: Required<InjectedServices>
	) {}

	protected formatArgs(options: readonly CommandInteractionOption[]): string {
		return options
			.filter(opt => opt.type !== 1 && opt.type !== 2) // skip subcommand/group
			.map(opt => `${opt.name}=${JSON.stringify(opt.value)}`)
			.join(', ');
	}

	protected getChannelName(intr: CommandInteraction | AutocompleteInteraction): string {
		if (
			intr.channel instanceof TextChannel ||
			intr.channel instanceof NewsChannel ||
			intr.channel instanceof ThreadChannel
		) {
			return intr.channel.name;
		}
		return 'DM';
	}

	public async process(intr: CommandInteraction | AutocompleteInteraction): Promise<void> {
		// Don't respond to self, or other bots
		if (intr.user.id === intr.client.user?.id || intr.user.bot) {
			return;
		}

		let commandParts =
			intr instanceof ChatInputCommandInteraction || intr instanceof AutocompleteInteraction
				? [
						intr.commandName,
						intr.options.getSubcommandGroup(false),
						intr.options.getSubcommand(false),
					].filter(filterNotNullOrUndefined)
				: [intr.commandName];
		let commandName = commandParts.join(' ');

		// Try to find the command the user wants
		let command = CommandUtils.findCommand(this.commands, commandParts);
		if (!command) {
			Logger.error(
				`[${intr.id}] A command with the name '${commandName}' could not be found.`
			);
			return;
		}

		if (intr instanceof AutocompleteInteraction) {
			if (!command.autocomplete) {
				Logger.error(
					`[${intr.id}] An autocomplete method for the '${commandName}' command could not be found.`
				);
				return;
			}

			try {
				let option = intr.options.getFocused(true);
				const acStart = Date.now();
				let choices = await command.autocomplete(intr, option, this.injectedServices);
				const acDuration = Date.now() - acStart;
				await InteractionUtils.respond(
					intr,
					choices?.slice(0, DiscordLimits.CHOICES_PER_AUTOCOMPLETE)
				);
				if (acDuration > 5000) {
					Logger.info(
						`[${intr.id}] Slow autocomplete for '${commandName}' ` +
							`option '${option.name}' by user '${intr.user.tag}' ` +
							`in channel '${this.getChannelName(intr)}' took ${acDuration}ms`
					);
				}
			} catch (error) {
				Logger.error(
					`[${intr.id}] An error occurred while executing the '${commandName}' autocomplete` +
						` for user '${intr.user.tag}' in channel '${this.getChannelName(intr)}'.`,
					error
				);
			}
			return;
		}

		// Check if user is rate limited
		let limited = this.rateLimiter.take(intr.user.id);
		if (limited) {
			return;
		}

		// Defer interaction
		// NOTE: Anything after this point we should be responding to the interaction
		let deferType = command.deferType;
		if (intr instanceof ChatInputCommandInteraction && command?.commands) {
			const subCommandName = intr.options.getSubcommand();
			const subCommand = CommandUtils.getSubCommandByName(command?.commands, subCommandName);
			if (subCommand && subCommand.deferType !== undefined) deferType = subCommand.deferType;
		}

		switch (deferType) {
			case CommandDeferType.PUBLIC: {
				await InteractionUtils.deferReply(intr, false);
				break;
			}
			case CommandDeferType.HIDDEN: {
				await InteractionUtils.deferReply(intr, true);
				break;
			}
		}

		// Return if defer was unsuccessful
		if (deferType !== CommandDeferType.NONE && !intr.deferred) {
			return;
		}

		const allOptions =
			intr instanceof ChatInputCommandInteraction
				? this.formatArgs(intr.options.data.flatMap(o => o.options ?? [o]))
				: '';
		const channelName = this.getChannelName(intr);
		const cmdStart = Date.now();

		try {
			// Check if interaction passes command checks
			let passesChecks = await CommandUtils.runChecks(command, intr);
			if (passesChecks) {
				// Execute the command
				await command.execute(intr, this.injectedServices);
			}

			const duration = Date.now() - cmdStart;
			Logger.info(
				`[${intr.id}] '/${commandName}' by '${intr.user.tag}' ` +
					`in '${channelName}' completed in ${duration}ms` +
					(allOptions ? ` | args: ${allOptions}` : '')
			);
		} catch (error) {
			// Kobold Errors are expected error messages encountered through regular use of the bot
			// These result in a simple response message and no error logging
			if (error instanceof KoboldError) {
				await InteractionUtils.send(intr, error.responseMessage, error.ephemeral);
				return;
			}
			await this.sendError(intr);

			const duration = Date.now() - cmdStart;
			// Log command error
			Logger.error(
				`[${intr.id}] Error executing '/${commandName}' by '${intr.user.tag}' ` +
					`in '${channelName}' after ${duration}ms` +
					(allOptions ? ` | args: ${allOptions}` : ''),
				error
			);
		}
	}

	protected async sendError(intr: CommandInteraction): Promise<void> {
		try {
			const embed = new KoboldEmbed();
			embed.setTitle('Something went Wrong!');
			embed.setDescription(
				`Kobold ran into an unexpected error. ${refs.embedLinks.errorReport}`
			);
			await InteractionUtils.send(intr, embed);
		} catch {
			console.error('Failed to send error message!');
		}
	}
}
