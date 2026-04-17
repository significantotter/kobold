import type { BestiaryEntry, CompendiumEntry } from '../schemas/index.js';
import { nethysMarkdownToDiscordMarkdown } from './nethysMarkdownParser.js';
export { NethysEmoji } from './nethysMarkdownParser.js';
export class NethysParser {
	constructor() {}
	public async parseNethysMarkdown(markdown: string, baseUrl?: string): Promise<string> {
		return await nethysMarkdownToDiscordMarkdown(markdown, baseUrl);
	}
	public async parseCompendiumEntry(
		compendiumEntry: CompendiumEntry,
		baseUrl?: string
	): Promise<string> {
		return await nethysMarkdownToDiscordMarkdown(compendiumEntry.markdown, baseUrl);
	}
	public async parseBestiary(BestiaryEntry: BestiaryEntry, baseUrl?: string): Promise<string> {
		return await nethysMarkdownToDiscordMarkdown(BestiaryEntry.markdown, baseUrl);
	}
	public stripMarkdownLinks(markdown: string): string {
		return markdown.replaceAll(/\[([^\]\[]+)\]\([^\)\(]+\)/g, '$1');
	}
}
