import type {
	ApplicationCommandType as ApplicationCommandTypeSource,
	ApplicationCommandOptionType as ApplicationCommandOptionTypeSource,
} from 'discord.js';

export const ApplicationCommandType: typeof ApplicationCommandTypeSource = {
	ChatInput: 1,
	User: 2,
	Message: 3,
	PrimaryEntryPoint: 4,
};

export const ApplicationCommandOptionType: typeof ApplicationCommandOptionTypeSource = {
	Subcommand: 1,
	SubcommandGroup: 2,
	String: 3,
	Integer: 4,
	Boolean: 5,
	User: 6,
	Channel: 7,
	Role: 8,
	Mentionable: 9,
	Number: 10,
	Attachment: 11,
} as const;
