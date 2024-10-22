import type {
	RESTPostAPIApplicationCommandsJSONBody,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	PermissionsString,
	APIApplicationCommandOption,
} from 'discord.js';
import { CommandDeferType } from '../helpers.ts';

export type CommandOptions = Record<string, APIApplicationCommandOption>;

export interface CommandReference {
	definition: CommandDefinition<string>;
	documentation: CommandDocumentation<CommandDefinition<string>>;
	options: CommandOptions;
}

export enum CommandResponseTypeEnum {
	success = 'success',
	error = 'error',
	indeterminate = 'indeterminate',
}

export interface CommandDefinition<T> {
	metadata: Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'options'>;
	subCommands: Record<T, SubCommandDefinition>;
	cooldown?: RateLimiter;
	deferType?: CommandDeferType;
	requireClientPerms?: PermissionsString[];
	restrictedGuilds?: string[];
	cooldown?: number;
}
export interface CommandDocumentationEmbed {
	title: string;
	description?: string;
	footer?: string;
	thumbnail?: string;
	url?: string;
	color?: string;
	fields: {
		name: string;
		value: string;
		// If using inline, you must also provide an inlineIndex
		// This index determines whether the field is placed on the
		// left (1), middle (2), or right (3)
		inline?: boolean;
		inlineIndex?: number;
	}[];
}

export interface ExtendedOptionDocumentation {
	description?: string;
}

export interface CommandDocumentationExample {
	title: string;
	type: CommandResponseTypeEnum;
	message?: string;
	embeds?: CommandDocumentationEmbed[];
	options: record<string, any>;
}
export interface SubCommandDocumentationExample {
	name: string;
	description: string;
	usage: string | null;
	extendedOptionDocumentation?: Record<string, ExtendedOptionDocumentation>;
	examples: CommandDocumentationExample[];
}

export interface CommandDocumentation<T extends CommandDefinition> {
	name: string;
	description: string;
	subCommands: {
		[key in keyof T['subCommands']]: {
			name: string;
			description: string;
			usage: string | null;
			extendedOptionDocumentation?: {
				[k in keyof T['subCommands'][key]['options']]?: ExtendedOptionDocumentation;
			};
			examples: {
				title: string;
				type: CommandResponseTypeEnum;
				message?: string;
				embeds?: CommandDocumentationEmbed[];
				options: { [k in keyof T['subCommands'][key]['options']]?: any };
			}[];
		};
	};
}

export interface SubCommandDefinition {
	name: string;
	description: string;
	type: ApplicationCommandOptionType.Subcommand | ApplicationCommandType.ChatInput;
	options?: Record<string, APIApplicationCommandOption>;
	dm_permission?: boolean;
	default_member_permissions?: undefined;
}
