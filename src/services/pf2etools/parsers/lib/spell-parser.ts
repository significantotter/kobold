import { EmbedData } from 'discord.js';
import { Spell } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function _parseSpell(this: CompendiumEmbedParser, spell: Spell) {
	const preprocessedData = (await this.preprocessData(spell)) as Spell;
	return parseSpell.call(this, preprocessedData);
}

export function parseSpell(this: CompendiumEmbedParser, spell: Spell): EmbedData {
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
	let emoji = entryParser.parseActivityEmoji(spell?.cast);
	emoji = emoji.replaceAll(' to ', '...');
	if (emoji) emoji = ` ${emoji}`;
	let title = `${spell.name}${emoji} (${
		spell.focus ? 'Focus' : spell.level === 0 ? 'Cantrip' : 'Spell'
	} ${spell.level})`;

	const descriptionLines: string[] = [];

	if (spell.traits) descriptionLines.push(`**Traits:** ${spell.traits.join(', ')}`);
	if (spell.subclass) {
		const subclasses = Object.entries(spell.subclass).map(
			([subclassFeature, subclassNames]) => {
				return `((${subclassFeature.split('|')[0]}** ${subclassNames
					.map(subclassName => subclassName.split('|')[0])
					.join(', ')}`;
			}
		);
		descriptionLines.push(`**Subclass:** ${subclasses}`);
	}
	if (spell.traditions) descriptionLines.push(`**Traditions:** ${spell.traditions.join(', ')}`);
	if (spell.requirements) descriptionLines.push(`**Requirements:** ${spell.requirements}`);
	let castLine: string[] = [];
	if (spell.cast) castLine.push(`**Cast:** ${entryParser.parseActivity(spell.cast)}`);
	if (spell.trigger) castLine.push(`**Trigger:** ${spell.trigger}`);
	if (castLine.length) descriptionLines.push(castLine.join('; '));

	let rangeLine: string[] = [];
	if (spell.range) rangeLine.push(`**Range:** ${this.helpers.parseTypedNumber(spell.range)}`);
	if (spell.area) rangeLine.push(`**Area:** ${spell.area.entry}`);
	if (spell.targets) rangeLine.push(`**Targets:** ${spell.targets}`);
	if (rangeLine.length) descriptionLines.push(rangeLine.join('; '));
	if (spell.duration)
		descriptionLines.push(`**Duration:** ${this.helpers.parseDuration(spell.duration)}`);
	if (spell.savingThrow) {
		const saveMap: { [k: string]: string } = {
			F: 'Fortitude',
			R: 'Reflex',
			W: 'Will',
		};
		const save = spell.savingThrow.type.map(save => saveMap[save] ?? save).join(' or ');
		const basicText = spell.savingThrow.basic ? 'basic ' : '';
		descriptionLines.push(`**Saving Throw:** ${basicText}${save}`);
	}

	descriptionLines.push('');
	descriptionLines.push(entryParser.parseEntries(spell.entries));

	if (spell.heightened) {
		descriptionLines.push('');
		descriptionLines.push(entryParser.parseHeightening(spell.heightened));
	}
	if (spell.amp?.entries) {
		descriptionLines.push(`**Amp** ${entryParser.parseEntries(spell.amp.entries)}`);
	}
	if (spell.amp?.heightened) {
		descriptionLines.push(
			entryParser
				.parseHeightening(spell.amp.heightened)
				.replaceAll('Heightened', 'Amp Heightened')
		);
	}

	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
