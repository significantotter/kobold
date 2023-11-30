import { Message } from 'discord.js';

export interface Trigger {
	requireGuild: boolean;
	triggered(msg: Message): boolean;
	execute(msg: Message): Promise<void>;
}
