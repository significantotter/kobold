import type {
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIApplicationCommandOption,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	InteractionContextType,
} from 'discord-api-types/v10';
import { CommandDeferType } from '../helpers.js';
import { CommandResponseTypeEnum } from './enums.js';

/** Permission strings for Discord commands */
export type PermissionsString = string;

/** Generic string enum type */
export type StringEnum = Record<string, string>;

export type CommandOptions = Record<string, APIApplicationCommandOption>;
export type SpecificCommandOptions<T extends string> = {
	[key in T]: APIApplicationCommandOption;
};

export interface CommandReference {
	definition: CommandDefinition<string>;
	documentation: CommandDocumentation<CommandDefinition<string>>;
	options: CommandOptions;
	subCommandEnum: StringEnum;
	commandOptionsEnum: StringEnum;
	/** Optional command strings for user-facing messages */
	strings?: Record<string, unknown>;
	/** Optional choice values for options with predefined choices */
	optionChoices?: Record<string, unknown>;
}

export interface CommandDefinition<T extends string> {
	metadata: Omit<RESTPostAPIChatInputApplicationCommandsJSONBody, 'options'>;
	subCommands: Record<T, SubCommandDefinition>;
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
	options: Record<string, any>;
}
export interface SubCommandDocumentationExample {
	name: string;
	description: string;
	usage: string | null;
	extendedOptionDocumentation?: Record<string, ExtendedOptionDocumentation>;
	examples: CommandDocumentationExample[];
}

export interface CommandDocumentation<T extends CommandDefinition<string>> {
	name: string;
	description: string;
	subCommands: {
		[key in keyof T['subCommands']]: {
			name: string;
			description: string;
			usage: string | null;
			extendedOptionDocumentation?: Record<string, ExtendedOptionDocumentation>;
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
	deferType?: CommandDeferType;
	requireClientPerms?: PermissionsString[];
	restrictedGuilds?: string[];
	type: ApplicationCommandOptionType.Subcommand | ApplicationCommandType.ChatInput;
	options?: Record<string, APIApplicationCommandOption>;
	contexts?: InteractionContextType[];
	default_member_permissions?: undefined;
}
