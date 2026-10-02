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
import { CommandTimingContext } from '../services/command-timing-context.js';
import { CommandUtils, FormatUtils, InteractionUtils } from '../utils/index.js';
import { EventHandler } from './event-handler.js';
import { Config } from '@kobold/config';
import { KoboldEmbed } from '../utils/kobold-embed-utils.js';
import { refs } from '../constants/common-text.js';
import { KoboldError } from '@kobold/util';
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
		const receivedAt = Date.now();
		const gatewayLagMs = Math.max(0, receivedAt - intr.createdTimestamp);

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
		Logger.info(`[${intr.id}] Interaction received for '${commandName}'.`, {
			event: 'interaction_received',
			interactionId: intr.id,
			interactionType: intr instanceof AutocompleteInteraction ? 'autocomplete' : 'command',
			commandName,
			receivedAt: new Date(receivedAt).toISOString(),
			createdAt: new Date(intr.createdTimestamp).toISOString(),
			gatewayLagMs,
		});

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

			let failureStage = 'processing';
			let autocompleteTiming = CommandTimingContext.snapshot();
			try {
				let option = intr.options.getFocused(true);
				const acStart = Date.now();
				let choices = await CommandTimingContext.run(
					{ commandName, interactionId: intr.id },
					async () => {
						try {
							return await command.autocomplete!(intr, option, this.injectedServices);
						} finally {
							autocompleteTiming = CommandTimingContext.snapshot();
						}
					}
				);
				const acDuration = Date.now() - acStart;
				failureStage = 'response';
				const responseStart = Date.now();
				await InteractionUtils.respond(
					intr,
					choices?.slice(0, DiscordLimits.CHOICES_PER_AUTOCOMPLETE)
				);
				const responseDuration = Date.now() - responseStart;
				const totalDuration = Date.now() - receivedAt;
				Logger.info(
					`[${intr.id}] Autocomplete '${commandName}' completed in ${totalDuration}ms` +
						` | processing=${acDuration}ms response=${responseDuration}ms` +
						` gateway=${gatewayLagMs}ms`,
					{
						event: 'autocomplete_completed',
						dbDurationMs: autocompleteTiming.dbDurationMs,
						dbQueryCount: autocompleteTiming.dbQueryCount,
						interactionId: intr.id,
						commandName,
						optionName: option.name,
						choiceCount: choices?.length ?? 0,
						processingDurationMs: acDuration,
						responseDurationMs: responseDuration,
						totalDurationMs: totalDuration,
						gatewayLagMs,
					}
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
						` for user '${intr.user.tag}' in channel '${this.getChannelName(intr)}'` +
						` after ${Date.now() - receivedAt}ms | gateway=${gatewayLagMs}ms.`,
					{
						err: error,
						event: 'autocomplete_failed',
						failureStage,
						dbDurationMs: autocompleteTiming.dbDurationMs,
						dbQueryCount: autocompleteTiming.dbQueryCount,
						interactionId: intr.id,
						commandName,
						totalDurationMs: Date.now() - receivedAt,
						gatewayLagMs,
					}
				);
			}
			return;
		}

		// Check if user is rate limited
		let limited = this.rateLimiter.take(intr.user.id);
		if (limited) {
			await InteractionUtils.send(
				intr,
				new KoboldEmbed({
					description: `You can only run ${Config.rateLimiting.commands.amount.toLocaleString()} command(s) every ${FormatUtils.duration(
						Config.rateLimiting.commands.interval * 1000
					)}. Please wait before attempting another command.`,
				}),
				true
			);
			Logger.info(
				`[${intr.id}] '/${commandName}' by '${intr.user.tag}' ` +
					`in '${this.getChannelName(intr)}' was rate limited`
			);
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

		let deferDuration = 0;
		if (deferType !== CommandDeferType.NONE) {
			const deferStart = Date.now();
			try {
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
			} catch (error) {
				deferDuration = Date.now() - deferStart;
				await Logger.error(
					`[${intr.id}] Interaction defer failed after ${deferDuration}ms` +
						` | gateway=${gatewayLagMs}ms total=${Date.now() - receivedAt}ms.`,
					{
						err: error,
						event: 'interaction_defer_failed',
						interactionId: intr.id,
						commandName,
						deferDurationMs: deferDuration,
						gatewayLagMs,
						totalDurationMs: Date.now() - receivedAt,
					}
				);
				throw error;
			}
			deferDuration = Date.now() - deferStart;
		}

		// Return if defer was unsuccessful
		if (deferType !== CommandDeferType.NONE && !intr.deferred) {
			Logger.warn(
				`[${intr.id}] Interaction defer did not acknowledge the command` +
					` after ${deferDuration}ms | gateway=${gatewayLagMs}ms` +
					` total=${Date.now() - receivedAt}ms.`,
				{
					event: 'interaction_defer_unacknowledged',
					interactionId: intr.id,
					commandName,
					deferDurationMs: deferDuration,
					gatewayLagMs,
					totalDurationMs: Date.now() - receivedAt,
				}
			);
			return;
		}
		if (deferType !== CommandDeferType.NONE) {
			Logger.info(
				`[${intr.id}] Interaction deferred in ${deferDuration}ms` +
					` | gateway=${gatewayLagMs}ms total=${Date.now() - receivedAt}ms.`,
				{
					event: 'interaction_deferred',
					interactionId: intr.id,
					commandName,
					deferDurationMs: deferDuration,
					gatewayLagMs,
					totalDurationMs: Date.now() - receivedAt,
				}
			);
		}

		const allOptions =
			intr instanceof ChatInputCommandInteraction
				? this.formatArgs(intr.options.data.flatMap(o => o.options ?? [o]))
				: '';
		const channelName = this.getChannelName(intr);
		const cmdStart = Date.now();
		let timing = CommandTimingContext.snapshot();

		try {
			await CommandTimingContext.run(
				{
					commandName,
					interactionId: intr.id,
				},
				async () => {
					try {
						// Check if interaction passes command checks
						let passesChecks = await CommandUtils.runChecks(command, intr);
						if (passesChecks) {
							// Execute the command
							await command.execute(intr, this.injectedServices);
						}
					} finally {
						timing = CommandTimingContext.snapshot();
					}
				}
			);

			const duration = Date.now() - cmdStart;
			const totalDuration = Date.now() - receivedAt;
			const nonDbDuration = Math.max(0, duration - timing.dbDurationMs);
			Logger.info(
				`[${intr.id}] '/${commandName}' by '${intr.user.tag}' ` +
					`in '${channelName}' completed in ${duration}ms` +
					` | db=${Math.round(timing.dbDurationMs)}ms` +
					` queries=${timing.dbQueryCount}` +
					` nonDb=${Math.round(nonDbDuration)}ms` +
					` total=${totalDuration}ms gateway=${gatewayLagMs}ms defer=${deferDuration}ms` +
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
			const totalDuration = Date.now() - receivedAt;
			// Log command error
			const nonDbDuration = Math.max(0, duration - timing.dbDurationMs);
			Logger.error(
				`[${intr.id}] Error executing '/${commandName}' by '${intr.user.tag}' ` +
					`in '${channelName}' after ${duration}ms` +
					` | db=${Math.round(timing.dbDurationMs)}ms` +
					` queries=${timing.dbQueryCount}` +
					` nonDb=${Math.round(nonDbDuration)}ms` +
					` total=${totalDuration}ms gateway=${gatewayLagMs}ms defer=${deferDuration}ms` +
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
