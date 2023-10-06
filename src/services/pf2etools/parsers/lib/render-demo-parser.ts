import { EmbedData } from 'discord.js';
import { RenderDemo } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseRenderDemo(this: CompendiumEmbedParser, renderDemo: RenderDemo) {
	const preprocessedData = (await this.preprocessData(renderDemo)) as RenderDemo;
	return parseRenderDemo.call(this, preprocessedData);
}

export function parseRenderDemo(this: CompendiumEmbedParser, renderDemo: RenderDemo): EmbedData {
	const title = `${renderDemo.name}`;
	const entryParser = new EntryParser({ delimiter: '\n\n', emojiConverter: this.emojiConverter });
	const descriptionLines: string[] = [];

	descriptionLines.push(entryParser.parseEntries(renderDemo.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
