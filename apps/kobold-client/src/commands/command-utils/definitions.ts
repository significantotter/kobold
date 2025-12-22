import type { CommandDefinition, SubCommandDefinition } from '@kobold/documentation';
import {
	InteractionContextType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIApplicationCommandOption,
} from 'discord.js';
import _ from 'lodash';

/**
 * Build metadata for a top-level command (includes all subcommands as options)
 */
function buildCommandMetadata(
	commandDefinition: CommandDefinition<string>
): RESTPostAPIChatInputApplicationCommandsJSONBody {
	return {
		name: commandDefinition.metadata.name,
		description: commandDefinition.metadata.description,
		contexts: anyUsageContext,
		default_member_permissions: undefined,
		options: _.values(commandDefinition.subCommands).map(subCmd => ({
			...subCmd,
			options: _.values(subCmd.options) as APIApplicationCommandOption[],
		})) as APIApplicationCommandOption[],
	};
}

/**
 * Build metadata for a specific subcommand
 */
function buildSubCommandMetadata(
	subCommandDef: SubCommandDefinition
): RESTPostAPIChatInputApplicationCommandsJSONBody {
	return {
		name: subCommandDef.name,
		description: subCommandDef.description,
		contexts: subCommandDef.contexts ?? anyUsageContext,
		default_member_permissions: subCommandDef.default_member_permissions,
		options: _.sortBy(
			_.values(subCommandDef.options),
			'_order'
		) as APIApplicationCommandOption[],
	};
}

export function getMetadataForCommand(
	commandDefinition: CommandDefinition<string>,
	subCommand?: string
): RESTPostAPIChatInputApplicationCommandsJSONBody {
	if (subCommand === undefined) {
		return buildCommandMetadata(commandDefinition);
	}
	return buildSubCommandMetadata(commandDefinition.subCommands[subCommand]);
}

export const anyUsageContext = [
	InteractionContextType.Guild,
	InteractionContextType.BotDM,
	InteractionContextType.PrivateChannel,
] as const satisfies InteractionContextType[];
