import { ButtonInteraction } from 'discord.js';

export interface Button {
	ids: string[];
	deferType: ButtonDeferType;
	requireGuild: boolean;
	requireEmbedAuthorTag: boolean;
	execute(intr: ButtonInteraction): Promise<void>;
}

export enum ButtonDeferType {
	REPLY = 'REPLY',
	UPDATE = 'UPDATE',
	NONE = 'NONE',
}
