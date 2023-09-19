import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	CommandInteraction,
	NewsChannel,
	TextChannel,
	ThreadChannel,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { Command, CommandDeferType } from '../commands/index.js';
import { DiscordLimits } from '../constants/index.js';
import { Logger } from '../services/index.js';
import { CommandUtils, InteractionUtils } from '../utils/index.js';
import { EventHandler } from './index.js';
import { Config } from './../config/config.js';
import Logs from './../config/lang/logs.json' assert { type: 'json' };
import { KoboldEmbed } from '../utils/kobold-embed-utils.js';
import { refs } from '../constants/common-text.js';
import { KoboldError } from '../utils/KoboldError.js';
import L from '../i18n/i18n-node.js';
import { filterNotNullOrUndefined } from '../utils/type-guards.js';

export class CommandHandler implements EventHandler {
	private rateLimiter = new RateLimiter(
		Config.rateLimiting.commands.amount,
		Config.rateLimiting.commands.interval * 1000
	);

	constructor(public commands: Command[]) {}

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
				Logs.error.commandNotFound
					.replaceAll('{INTERACTION_ID}', intr.id)
					.replaceAll('{COMMAND_NAME}', commandName)
			);
			return;
		}

		if (intr instanceof AutocompleteInteraction) {
			if (!command.autocomplete) {
				Logger.error(
					Logs.error.autocompleteNotFound
						.replaceAll('{INTERACTION_ID}', intr.id)
						.replaceAll('{COMMAND_NAME}', commandName)
				);
				return;
			}

			try {
				let option = intr.options.getFocused(true);
				let choices = await command.autocomplete(intr, option);
				await InteractionUtils.respond(
					intr,
					choices?.slice(0, DiscordLimits.CHOICES_PER_AUTOCOMPLETE)
				);
			} catch (error) {
				Logger.error(
					intr.channel instanceof TextChannel ||
						intr.channel instanceof NewsChannel ||
						intr.channel instanceof ThreadChannel
						? Logs.error.autocompleteGuild
								.replaceAll('{INTERACTION_ID}', intr.id)
								.replaceAll('{OPTION_NAME}', commandName)
								.replaceAll('{COMMAND_NAME}', commandName)
								.replaceAll('{USER_TAG}', intr.user.tag)
								.replaceAll('{USER_ID}', intr.user.id)
								.replaceAll('{CHANNEL_NAME}', intr.channel.name)
								.replaceAll('{CHANNEL_ID}', intr.channel.id)
								.replaceAll('{GUILD_NAME}', intr.guild?.name ?? '')
								.replaceAll('{GUILD_ID}', intr.guild?.id ?? '')
						: Logs.error.autocompleteOther
								.replaceAll('{INTERACTION_ID}', intr.id)
								.replaceAll('{OPTION_NAME}', commandName)
								.replaceAll('{COMMAND_NAME}', commandName)
								.replaceAll('{USER_TAG}', intr.user.tag)
								.replaceAll('{USER_ID}', intr.user.id),
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

		try {
			// Check if interaction passes command checks
			let passesChecks = await CommandUtils.runChecks(command, intr);
			if (passesChecks) {
				// Execute the command
				const LL = L.en;
				await command.execute(intr, LL);
			}
		} catch (error) {
			// Kobold Errors are expected error messages encountered through regular use of the bot
			// These result in a simple response message and no error logging
			if (error instanceof KoboldError) {
				await InteractionUtils.send(intr, error.responseMessage);
				return;
			}
			await this.sendError(intr);

			// Log command error
			Logger.error(
				intr.channel instanceof TextChannel ||
					intr.channel instanceof NewsChannel ||
					intr.channel instanceof ThreadChannel
					? Logs.error.commandGuild
							.replaceAll('{INTERACTION_ID}', intr.id)
							.replaceAll('{COMMAND_NAME}', commandName)
							.replaceAll('{USER_TAG}', intr.user.tag)
							.replaceAll('{USER_ID}', intr.user.id)
							.replaceAll('{CHANNEL_NAME}', intr.channel.name)
							.replaceAll('{CHANNEL_ID}', intr.channel.id)
							.replaceAll('{GUILD_NAME}', intr.guild?.name ?? '')
							.replaceAll('{GUILD_ID}', intr.guild?.id ?? '')
					: Logs.error.commandOther
							.replaceAll('{INTERACTION_ID}', intr.id)
							.replaceAll('{COMMAND_NAME}', commandName)
							.replaceAll('{USER_TAG}', intr.user.tag)
							.replaceAll('{USER_ID}', intr.user.id),
				error
			);
		}
	}

	private async sendError(intr: CommandInteraction): Promise<void> {
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
