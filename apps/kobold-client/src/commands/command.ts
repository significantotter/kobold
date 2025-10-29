import {
	ApplicationCommandOptionChoiceData,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CommandInteraction,
	PermissionsString,
	RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { Kobold } from '@kobold/db';
import { TranslationFunctions } from './../i18n/i18n-types.js';
import { NethysDb } from '@kobold/nethys';
import { getMetadataForCommand } from './command-utils/definitions.js';
import type { CommandReference } from '@kobold/documentation';

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
	name: string;
	metadata: RESTPostAPIApplicationCommandsJSONBody;
	cooldown?: RateLimiter;
	deferType: CommandDeferType;
	requireClientPerms: PermissionsString[];
	restrictedGuilds?: string[];
	commands: Command[];
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
	kobold: Kobold;
	nethysCompendium: NethysDb;
}

export enum CommandDeferType {
	PUBLIC = 'PUBLIC',
	HIDDEN = 'HIDDEN',
	NONE = 'NONE',
}

export function BaseCommandClass<T extends CommandReference>(
	commandReference: T,
	subCommand: string | undefined = undefined
): { new (): Command } {
	const name = subCommand
		? commandReference.definition.subCommands[subCommand]?.name ||
			commandReference.definition.metadata.name
		: commandReference.definition.metadata.name;
	const metadata = getMetadataForCommand(commandReference.definition, subCommand);
	const deferType = commandReference.definition.deferType || CommandDeferType.PUBLIC;
	const requireClientPerms = commandReference.definition.requireClientPerms || [];
	const restrictedGuilds = commandReference.definition.restrictedGuilds || [];

	const commandClass = class implements Command {
		commands: Command[] = [];
		constructor(commands?: Command[]) {
			this.commands = commands ?? [];
		}
		name = name;
		metadata = metadata;
		deferType = deferType;
		requireClientPerms = requireClientPerms;
		restrictedGuilds = restrictedGuilds;
		public async execute(): Promise<void> {}
	};

	return commandClass;
}
