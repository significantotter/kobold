import { ChatInputCommandInteraction, Client } from 'discord.js';
import { Sheet } from './sheet.schema.js';

export type ModelWithSheet = {
	name?: string;
	sheet?: Sheet;
	hideStats?: boolean;
	saveSheet(intr: ChatInputCommandInteraction, sheet: Sheet): Promise<void>;
	[key: string]: any;
};
