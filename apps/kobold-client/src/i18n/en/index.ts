import type { BaseTranslation } from '../i18n-types.js';
import AdminCommand from './commands/admin.js';
import CharacterCommand from './commands/character.js';
import CounterCommand from './commands/counter.js';
import CounterGroupCommand from './commands/counterGroup.js';
import GameCommand from './commands/game.js';
import GameplayCommand from './commands/gameplay.js';
import HelpCommand from './commands/help.js';
import InitCommand from './commands/init.js';
import ModifierCommand from './commands/modifier.js';
import RollCommand from './commands/roll.js';
import RollMacroCommand from './commands/rollMacro.js';
import SettingsCommand from './commands/settings.js';
import UtilsLang from './utils.js';
import commandOptions from './commandOptions.js';
import ActionCommand from './commands/action.js';
import ActionStageCommand from './commands/actionStage.js';
import SharedInteractions from './sharedInteractions.js';
import CompendiumCommand from './commands/compendium.js';
import ConditionCommand from './commands/condition.js';

const en: BaseTranslation = {
	terms: {
		perception: 'Perception',
	},
	sharedInteractions: SharedInteractions,
	commands: {
		admin: AdminCommand,
		action: ActionCommand,
		actionStage: ActionStageCommand,
		compendium: CompendiumCommand,
		condition: ConditionCommand,
		counter: CounterCommand,
		counterGroup: CounterGroupCommand,
		help: HelpCommand,
		character: CharacterCommand,
		init: InitCommand,
		modifier: ModifierCommand,
		roll: RollCommand,
		rollMacro: RollMacroCommand,
		game: GameCommand,
		gameplay: GameplayCommand,
		settings: SettingsCommand,
	},
	commandOptions: commandOptions,
	utils: UtilsLang,
};

export default en;
