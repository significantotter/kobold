import { CommandExport } from '../../command.js';
import { HelpCommand } from './help-command.js';
import { HelpFaqSubCommand } from './help-faq-subcommand.js';
import { HelpAboutSubCommand } from './help-about-subcommand.js';
import { HelpCommandsSubCommand } from './help-commands-subcommand.js';
import { HelpCharacterSubCommand } from './help-character-subcommand.js';
import { HelpCompendiumSubCommand } from './help-compendium-subcommand.js';
import { HelpInitSubCommand } from './help-init-subcommand.js';
import { HelpRollSubCommand } from './help-roll-subcommand.js';
import { HelpModifierSubCommand } from './help-modifier-subcommand.js';
import { HelpConditionSubCommand } from './help-condition-subcommand.js';
import { HelpCounterSubCommand } from './help-counter-subcommand.js';
import { HelpCounterGroupSubCommand } from './help-counter-group-subcommand.js';
import { HelpGameSubCommand } from './help-game-subcommand.js';
import { HelpGameplaySubCommand } from './help-gameplay-subcommand.js';
import { HelpAttributesAndTagsSubCommand } from './help-attributes-and-tags-subcommand.js';
import { HelpMakingACustomActionSubCommand } from './help-making-a-custom-action-subcommand.js';
import { HelpRollMacroSubCommand } from './help-roll-macro-subcommand.js';
import { HelpActionSubCommand } from './help-action-subcommand.js';
import { HelpActionStageSubCommand } from './help-action-stage-subcommand.js';
import { HelpSettingsSubCommand } from './help-settings-subcommand.js';

export const HelpCommandExport: CommandExport = {
	command: HelpCommand,
	subCommands: [
		HelpFaqSubCommand,
		HelpAboutSubCommand,
		HelpCommandsSubCommand,
		HelpCharacterSubCommand,
		HelpCompendiumSubCommand,
		HelpInitSubCommand,
		HelpRollSubCommand,
		HelpModifierSubCommand,
		HelpConditionSubCommand,
		HelpCounterSubCommand,
		HelpCounterGroupSubCommand,
		HelpGameSubCommand,
		HelpGameplaySubCommand,
		HelpAttributesAndTagsSubCommand,
		HelpMakingACustomActionSubCommand,
		HelpRollMacroSubCommand,
		HelpActionSubCommand,
		HelpActionStageSubCommand,
		HelpSettingsSubCommand,
	],
};
