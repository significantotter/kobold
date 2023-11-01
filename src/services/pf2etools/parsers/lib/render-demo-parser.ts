import type { EmbedData } from 'discord.js';
import type { RenderDemo } from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

export async function _parseRenderDemo(this: CompendiumEmbedParser, renderDemo: RenderDemo) {
	const preprocessedData = (await this.preprocessData(renderDemo)) as RenderDemo;
	return parseRenderDemo.call(this, preprocessedData);
}

export function parseRenderDemo(this: CompendiumEmbedParser, renderDemo: RenderDemo): EmbedData {
	const title = `${renderDemo.name}`;

	const descriptionLines: string[] = [];

	descriptionLines.push(this.entryParser.parseEntries(renderDemo.entries));
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
