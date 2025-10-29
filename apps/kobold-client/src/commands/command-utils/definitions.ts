import type { CommandDefinition } from '@kobold/documentation';
import {
	InteractionContextType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import _ from 'lodash';

export function getMetadataForCommand(
	commandDefinition: CommandDefinition<any>,
	subCommand: string | undefined = undefined
): RESTPostAPIChatInputApplicationCommandsJSONBody {
	const definition = subCommand
		? commandDefinition.subCommands[subCommand]
		: commandDefinition.metadata;
	return {
		type: definition.type,
		name: definition.name,
		description: definition.description,
		contexts: definition.contexts ?? anyUsageContext,
		default_member_permissions: definition.default_member_permissions ?? undefined,
		options:
			subCommand === undefined
				? // Options are stored with a key of their name, but Discord expects an array
					_.values(commandDefinition.subCommands).map(subCommand => ({
						...subCommand,
						options: _.values(subCommand.options),
					}))
				: _.sortBy(_.values(commandDefinition.subCommands[subCommand].options), '_order'),
	};
}

export const anyUsageContext = [
	InteractionContextType.Guild,
	InteractionContextType.BotDM,
	InteractionContextType.PrivateChannel,
] as const satisfies InteractionContextType[];
