import { Message, MessageReaction, User } from 'discord.js';

export interface Reaction {
	emoji: string;
	requireGuild: boolean;
	requireSentByClient: boolean;
	requireEmbedAuthorTag: boolean;
	execute(msgReaction: MessageReaction, msg: Message, reactor: User): Promise<void>;
}
