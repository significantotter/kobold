import type { BestiaryEntry, CompendiumEntry } from '../schemas/index.js';
import { nethysMarkdownToDiscordMarkdown } from './nethysMarkdownParser.js';
export { NethysEmoji } from './nethysMarkdownParser.js';
export class NethysParser {
	constructor() {}
	public async parseNethysMarkdown(markdown: string): Promise<string> {
		return await nethysMarkdownToDiscordMarkdown(markdown);
	}
	public async parseCompendiumEntry(compendiumEntry: CompendiumEntry): Promise<string> {
		return await nethysMarkdownToDiscordMarkdown(compendiumEntry.markdown);
	}
	public async parseBestiary(BestiaryEntry: BestiaryEntry): Promise<string> {
		return await nethysMarkdownToDiscordMarkdown(BestiaryEntry.markdown);
	}
	public stripMarkdownLinks(markdown: string): string {
		return markdown.replaceAll(/\[([^\]\[]+)\]\([^\)\(]+\)/g, '$1');
	}
}
