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
	execute(intr: CommandInteraction, services?: Partial<InjectedServices>): Promise<void>;
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
): { new (commands?: Command[]): Command } {
	const commandDefinition = commandReference.definition;
	const subCommandDefinition = subCommand ? commandDefinition.subCommands[subCommand] : null;
	const name = subCommandDefinition?.name || commandDefinition.metadata.name;
	const metadata = getMetadataForCommand(commandDefinition, subCommand);
	const deferType =
		subCommandDefinition?.deferType || commandDefinition.deferType || CommandDeferType.NONE;
	// The documentation package uses string[] for permissions, but we know they're valid PermissionsString values
	const requireClientPerms = (subCommandDefinition?.requireClientPerms ||
		commandDefinition.requireClientPerms ||
		[]) as PermissionsString[];
	const restrictedGuilds =
		subCommandDefinition?.restrictedGuilds || commandDefinition.restrictedGuilds || [];

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
