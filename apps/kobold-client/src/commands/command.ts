import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CommandInteraction,
	PermissionsString,
	RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { Kobold } from 'kobold-db';
import { CompendiumModel } from 'pf2etools-data';
import { TranslationFunctions } from './../i18n/i18n-types.js';

interface SubCommandConstructor {
	new (): Command;
}

interface CommandConstructor {
	new (commands: Command[]): Command;
}

export interface CommandExport {
	command: CommandConstructor;
	subCommands: SubCommandConstructor[];
}
export interface InjectedCommandData {}

export interface Command {
	names: String[];
	metadata: RESTPostAPIApplicationCommandsJSONBody;
	cooldown?: RateLimiter;
	deferType: CommandDeferType;
	requireClientPerms: PermissionsString[];
	restrictedGuilds?: string[];
	commands?: Command[];
	autocomplete?(
		intr: AutocompleteInteraction,
		option: AutocompleteFocusedOption,
		services?: Partial<InjectedServices>
	): Promise<ApplicationCommandOptionChoiceData[] | undefined>;
	execute(
		intr: CommandInteraction,
		LL: TranslationFunctions,
		services?: Partial<InjectedServices>
	): Promise<void>;
}

export interface InjectedServices {
	compendium: CompendiumModel;
	kobold: Kobold;
}

export enum CommandDeferType {
	PUBLIC = 'PUBLIC',
	HIDDEN = 'HIDDEN',
	NONE = 'NONE',
}
