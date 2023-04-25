import './config/config.js';
import { REST } from '@discordjs/rest';
import { Options, GatewayIntentBits, Partials } from 'discord.js';

import { Button } from './buttons/index.js';
import {
	// character
	CharacterCommand,
	CharacterSetActiveSubCommand,
	CharacterSetServerDefaultSubCommand,
	CharacterListSubCommand,
	CharacterUpdateSubCommand,
	CharacterRemoveSubCommand,
	CharacterImportSubCommand,
	CharacterSheetSubCommand,
	// roll
	RollCommand,
	RollDiceSubCommand,
	RollSkillSubCommand,
	RollSaveSubCommand,
	RollPerceptionSubCommand,
	RollAbilitySubCommand,
	RollAttackSubCommand,
	RollActionSubCommand,
	// init
	InitCommand,
	InitAddSubCommand,
	InitSetSubCommand,
	InitShowSubCommand,
	InitNextSubCommand,
	InitPrevSubCommand,
	InitJumpToSubCommand,
	InitStartSubCommand,
	InitJoinSubCommand,
	InitRemoveSubCommand,
	InitEndSubCommand,
	// modifier
	ModifierCommand,
	ModifierCreateSubCommand,
	ModifierRemoveSubCommand,
	ModifierListSubCommand,
	ModifierDetailSubCommand,
	ModifierExportSubCommand,
	ModifierImportSubCommand,
	ModifierUpdateSubCommand,
	ModifierToggleSubCommand,
	// game
	GameCommand,
	GameManageSubCommand,
	GameRollSubCommand,
	GameInitSubCommand,
	GameListSubCommand,
	// action
	ActionCommand,
	ActionListSubCommand,
	ActionDetailSubCommand,
	ActionCreateSubCommand,
	ActionRemoveSubCommand,
	ActionEditSubCommand,
	ActionImportSubCommand,
	ActionExportSubCommand,
	//action stage
	ActionStageCommand,
	ActionStageAddAttackSubCommand,
	ActionStageAddSaveSubCommand,
	ActionStageAddTextSubCommand,
	ActionStageAddBasicDamageSubCommand,
	ActionStageAddAdvancedDamageSubCommand,
	ActionStageEditSubCommand,
	ActionStageRemoveSubCommand,
	// roll macro
	RollMacroCommand,
	RollMacroListSubCommand,
	RollMacroCreateSubCommand,
	RollMacroUpdateSubCommand,
	RollMacroRemoveSubCommand,

	// help
	HelpCommand,
	// admin
	AdminCommand,
} from './commands/chat/index.js';
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
import { Job } from './jobs/index.js';
import { Bot } from './models/bot.js';
import { Reaction } from './reactions/index.js';
import { CommandRegistrationService, DBModel, JobService, Logger } from './services/index.js';
import { Trigger } from './triggers/index.js';
import { Config } from './config/config.js';
import Logs from './config/lang/logs.json';
import { checkAndLoadBestiaryFiles } from './services/pf2etools/bestiaryLoader.js';

async function start(): Promise<void> {
	DBModel.init(Config.database.url);

	// asynchronously load the bestiary files
	checkAndLoadBestiaryFiles();

	// Client
	let client = new CustomClient({
		intents: (Config.client.intents as string[]).map(intent => GatewayIntentBits[intent]),
		partials: (Config.client.partials as string[]).map(partial => Partials[partial]),
		makeCache: Options.cacheWithLimits({
			// Keep default caching behavior
			...Options.DefaultMakeCacheSettings,
			// Override specific options from config
			...Config.client.caches,
		}),
	});

	// Commands
	let commands: Command[] = [
		// Help
		new HelpCommand(),

		// Admin
		new AdminCommand(),

		// Character Commands
		new CharacterCommand([
			new CharacterSheetSubCommand(),
			new CharacterListSubCommand(),
			new CharacterSetActiveSubCommand(),
			new CharacterSetServerDefaultSubCommand(),
			new CharacterImportSubCommand(),
			new CharacterUpdateSubCommand(),
			new CharacterRemoveSubCommand(),
		]),

		//Roll Commands
		new RollCommand([
			new RollDiceSubCommand(),
			new RollActionSubCommand(),
			new RollAttackSubCommand(),
			new RollSkillSubCommand(),
			new RollSaveSubCommand(),
			new RollPerceptionSubCommand(),
			new RollAbilitySubCommand(),
		]),

		// Init commands
		new InitCommand([
			new InitAddSubCommand(),
			new InitSetSubCommand(),
			new InitStartSubCommand(),
			new InitShowSubCommand(),
			new InitNextSubCommand(),
			new InitPrevSubCommand(),
			new InitJumpToSubCommand(),
			new InitJoinSubCommand(),
			new InitRemoveSubCommand(),
			new InitEndSubCommand(),
		]),

		// Modifier commands
		new ModifierCommand([
			new ModifierCreateSubCommand(),
			new ModifierRemoveSubCommand(),
			new ModifierListSubCommand(),
			new ModifierDetailSubCommand(),
			new ModifierExportSubCommand(),
			new ModifierImportSubCommand(),
			new ModifierUpdateSubCommand(),
			new ModifierToggleSubCommand(),
		]),

		// Game commands
		new GameCommand([
			new GameRollSubCommand(),
			new GameInitSubCommand(),
			new GameListSubCommand(),
			new GameManageSubCommand(),
		]),

		// Action commands
		new ActionCommand([
			new ActionListSubCommand(),
			new ActionDetailSubCommand(),
			new ActionCreateSubCommand(),
			new ActionRemoveSubCommand(),
			new ActionEditSubCommand(),
			new ActionImportSubCommand(),
			new ActionExportSubCommand(),
		]),

		new ActionStageCommand([
			new ActionStageAddAttackSubCommand(),
			new ActionStageAddSaveSubCommand(),
			new ActionStageAddTextSubCommand(),
			new ActionStageAddBasicDamageSubCommand(),
			new ActionStageAddAdvancedDamageSubCommand(),
			new ActionStageEditSubCommand(),
			new ActionStageRemoveSubCommand(),
		]),

		new RollMacroCommand([
			new RollMacroListSubCommand(),
			new RollMacroCreateSubCommand(),
			new RollMacroUpdateSubCommand(),
			new RollMacroRemoveSubCommand(),
		]),
	];

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
			await commandRegistrationService.process(commands, process.argv);
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
