import { REST } from '@discordjs/rest';
import { Options } from 'discord.js';

import { Button } from './buttons/index.js';
import { HelpCommand, InfoCommand, TestCommand, ImportCommand } from './commands/chat/index.js';
import { Command } from './commands/index.js';
import { ViewDateSent } from './commands/message/index.js';
import { ViewDateJoined } from './commands/user/index.js';
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
import { Job } from './jobs/index.js';
import { Bot } from './models/bot.js';
import { Reaction } from './reactions/index.js';
import { CommandRegistrationService, DBModel, JobService, Logger } from './services/index.js';
import { Trigger } from './triggers/index.js';
import Config from './config/config.json';
import Logs from './config/lang/logs.json';

async function start(): Promise<void> {
	DBModel.init(Config.database.url);

	// Client
	let client = new CustomClient({
		intents: Config.client.intents as any,
		partials: Config.client.partials as any,
		makeCache: Options.cacheWithLimits({
			// Keep default caching behavior
			...Options.defaultMakeCacheSettings,
			// Override specific options from config
			...Config.client.caches,
		}),
	});

	// Commands
	let commands: Command[] = [
		// Chat Commands
		new ImportCommand(),
		new HelpCommand(),
		new InfoCommand(),
		new TestCommand(),
		// User Context Commands
		new ViewDateJoined(),
		// Message Context Commands
		new ViewDateSent(),
		// TODO: Add new commands here
	].sort((a, b) => (a.metadata.name > b.metadata.name ? 1 : -1));

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
	let commandHandler = new CommandHandler(commands);
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
			let localCmds = commands.map(cmd => cmd.metadata);
			await commandRegistrationService.process(localCmds, process.argv);
		} catch (error) {
			Logger.error(Logs.error.commandAction, error);
		}
		process.exit();
	}

	await bot.start();
}

process.on('unhandledRejection', (reason, _promise) => {
	Logger.error(Logs.error.unhandledRejection, reason);
});

start().catch(error => {
	Logger.error(Logs.error.unspecified, error);
});
