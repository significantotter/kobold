import { GatewayIntentBits, Options, Partials, REST, disableValidators } from 'discord.js';
import 'reflect-metadata';
import { Config } from '@kobold/config';

import { Button } from './buttons/index.js';
import { ChatCommandExports } from './commands/chat/index.js';
import { Command } from './commands/index.js';
import {
	ButtonHandler,
	CommandHandler,
	GuildJoinHandler,
	GuildLeaveHandler,
	MessageHandler,
	ReactionHandler,
	TriggerHandler,
} from './events/index.js';
import { CustomClient } from './extensions/index.js';
import { Bot } from './models/bot.js';
import { Reaction } from './reactions/index.js';
import { CommandRegistrationService, JobService, Logger } from './services/index.js';
import { Job } from './services/job-service.js';
import { Kobold, getDialect } from '@kobold/db';
import { Trigger } from './triggers/index.js';
import { NethysDb } from '@kobold/nethys';

// this is to prevent embeds breaking on "addFields" when adding more than an embed can hold
// because we batch our embeds afterwards instead of before assigning fields
disableValidators();

async function start(): Promise<void> {
	const PostgresDialect = getDialect(Config.database.url);
	const nethysCompendium = new NethysDb(Config.database.url);
	const kobold = new Kobold(PostgresDialect);

	// Client
	let client = new CustomClient({
		intents: (Config.client.intents as string[]).map(
			intent => GatewayIntentBits[intent as keyof typeof GatewayIntentBits]
		),
		partials: (Config.client.partials as string[]).map(
			partial => Partials[partial as keyof typeof Partials]
		),
		makeCache: Options.cacheWithLimits({
			// Keep default caching behavior
			...Options.DefaultMakeCacheSettings,
			// Override specific options from config
			...Config.client.caches,
		}),
	});

	// Commands
	let commands: Command[] = ChatCommandExports.map(commandExport => {
		const subCommands = commandExport.subCommands.map(subCommand => new subCommand());
		return new commandExport.command(subCommands);
	});

	// Buttons
	let buttons: Button[] = [
		// TODO: Add new buttons here
	];

	// Reactions
	let reactions: Reaction[] = [
		// TODO: Add new reactions here
	];

	// Triggers
	let triggers: Trigger[] = [
		// TODO: Add new triggers here
	];

	// Event handlers
	let guildJoinHandler = new GuildJoinHandler();
	let guildLeaveHandler = new GuildLeaveHandler();
	let commandHandler = new CommandHandler(commands, {
		nethysCompendium,
		kobold,
	});
	let buttonHandler = new ButtonHandler(buttons);
	let triggerHandler = new TriggerHandler(triggers);
	let messageHandler = new MessageHandler(triggerHandler);
	let reactionHandler = new ReactionHandler(reactions);

	// Jobs
	let jobs: Job[] = [
		// TODO: Add new jobs here
	];

	// Bot
	let bot = new Bot(
		Config.client.token,
		client,
		guildJoinHandler,
		guildLeaveHandler,
		messageHandler,
		commandHandler,
		buttonHandler,
		reactionHandler,
		new JobService(jobs)
	);

	// Register
	if (process.argv[2] == 'commands') {
		try {
			let rest = new REST({ version: '10' }).setToken(Config.client.token);
			let commandRegistrationService = new CommandRegistrationService(rest);
			await commandRegistrationService.process(commands, process.argv);
		} catch (error) {
			Logger.error('An error occurred while running a command action.', error);
		}
		process.exit();
	}

	await bot.start();
}

process.on('unhandledRejection', (reason, _promise) => {
	Logger.error('An unhandled promise rejection occurred.', reason);
});

start().catch(error => {
	Logger.error('An unspecified error occurred', error);
});
