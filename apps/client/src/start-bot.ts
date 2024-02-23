import { GatewayIntentBits, Options, Partials, REST, disableValidators } from 'discord.js';
import 'reflect-metadata';
import 'kobold-config';

import { Button } from './buttons/index.js';
import {
	// action
	ActionCommand,
	ActionCreateSubCommand,
	ActionDetailSubCommand,
	ActionEditSubCommand,
	ActionExportSubCommand,
	ActionImportSubCommand,
	ActionListSubCommand,
	ActionRemoveSubCommand,
	ActionStageAddAdvancedDamageSubCommand,
	ActionStageAddAttackSubCommand,
	ActionStageAddBasicDamageSubCommand,
	ActionStageAddSaveSubCommand,
	ActionStageAddSkillChallengeSubCommand,
	ActionStageAddTextSubCommand,
	//action stage
	ActionStageCommand,
	ActionStageEditSubCommand,
	ActionStageRemoveSubCommand,
	// admin
	AdminCommand,
	// character
	CharacterCommand,
	CharacterImportPathbuilderSubCommand,
	CharacterImportPasteBinSubCommand,
	CharacterImportWanderersGuideSubCommand,
	CharacterListSubCommand,
	CharacterRemoveSubCommand,
	CharacterSetActiveSubCommand,
	CharacterSetDefaultSubCommand,
	CharacterSheetSubCommand,
	CharacterUpdateSubCommand,
	// compendium
	CompendiumCommand,
	CompendiumSearchSubCommand,
	// game
	GameCommand,
	GameInitSubCommand,
	GameListSubCommand,
	GameManageSubCommand,
	GameRollSubCommand,
	// gameplay
	GameplayCommand,
	GameplayDamageSubCommand,
	GameplayRecoverSubCommand,
	GameplaySetSubCommand,
	GameplayTrackerSubCommand,
	// help
	HelpCommand,
	InitAddSubCommand,
	// init
	InitCommand,
	InitEndSubCommand,
	InitJoinSubCommand,
	InitJumpToSubCommand,
	InitNextSubCommand,
	InitPrevSubCommand,
	InitRemoveSubCommand,
	InitRollSubCommand,
	InitSetSubCommand,
	InitShowSubCommand,
	InitStartSubCommand,
	InitStatBlockSubCommand,
	// modifier
	ModifierCommand,
	ModifierCreateRollModifierSubCommand,
	ModifierCreateSheetModifierSubCommand,
	ModifierDetailSubCommand,
	ModifierExportSubCommand,
	ModifierImportSubCommand,
	ModifierListSubCommand,
	ModifierRemoveSubCommand,
	ModifierToggleSubCommand,
	ModifierUpdateSubCommand,
	RollActionSubCommand,
	RollAttackSubCommand,
	// roll
	RollCommand,
	RollDiceSubCommand,
	// roll macro
	RollMacroCommand,
	RollMacroCreateSubCommand,
	RollMacroListSubCommand,
	RollMacroRemoveSubCommand,
	RollMacroUpdateSubCommand,
	RollPerceptionSubCommand,
	RollSaveSubCommand,
	RollSkillSubCommand,
	// settings
	SettingsCommand,
	SettingsSetSubCommand,
} from './commands/chat/index.js';
import { Command } from './commands/index.js';
import { Config } from 'kobold-config';
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
import { Kobold, getDialect } from 'kobold-db';
import { CompendiumModel, CompendiumDb } from 'pf2etools-data';
import { Trigger } from './triggers/index.js';

// this is to prevent embeds breaking on "addFields" when adding more than an embed can hold
// because we batch our embeds afterwards instead of before assigning fields
disableValidators();

async function start(): Promise<void> {
	const PostgresDialect = getDialect(Config.database.url);
	const kobold = new Kobold(PostgresDialect);

	const compendium = new CompendiumModel(CompendiumDb);

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
			new CharacterSetDefaultSubCommand(),
			new CharacterImportWanderersGuideSubCommand(),
			new CharacterImportPathbuilderSubCommand(),
			new CharacterImportPasteBinSubCommand(),
			new CharacterUpdateSubCommand(),
			new CharacterRemoveSubCommand(),
		]),

		// Compendium Commands
		new CompendiumCommand([new CompendiumSearchSubCommand()]),

		//Roll Commands
		new RollCommand([
			new RollDiceSubCommand(),
			new RollActionSubCommand(),
			new RollAttackSubCommand(),
			new RollSkillSubCommand(),
			new RollSaveSubCommand(),
			new RollPerceptionSubCommand(),
		]),

		// Init commands
		new InitCommand([
			new InitAddSubCommand(),
			new InitSetSubCommand(),
			new InitStartSubCommand(),
			new InitShowSubCommand(),
			new InitStatBlockSubCommand(),
			new InitRollSubCommand(),
			new InitNextSubCommand(),
			new InitPrevSubCommand(),
			new InitJumpToSubCommand(),
			new InitJoinSubCommand(),
			new InitRemoveSubCommand(),
			new InitEndSubCommand(),
		]),

		// Modifier commands
		new ModifierCommand([
			new ModifierCreateRollModifierSubCommand(),
			new ModifierCreateSheetModifierSubCommand(),
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

		// Gameplay commands
		new GameplayCommand([
			new GameplayDamageSubCommand(),
			new GameplaySetSubCommand(),
			new GameplayRecoverSubCommand(),
			new GameplayTrackerSubCommand(),
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
			new ActionStageAddSkillChallengeSubCommand(),
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

		new SettingsCommand([new SettingsSetSubCommand()]),
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
	let commandHandler = new CommandHandler(commands, { compendium, kobold });
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
