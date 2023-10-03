import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Ritual } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';
import { nth } from '../compendium-parser-helpers.js';

export async function parseRitual(
	this: CompendiumEmbedParser,
	ritual: Ritual
): Promise<KoboldEmbed> {
	const title = `${ritual.name} (Ritual ${ritual.level})`;
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n' });
	const descriptionLines: string[] = [];
	if (ritual.traits) descriptionLines.push(`**Traits** ${ritual.traits.join(', ')}`);
	if (ritual.cast) {
		let castString = `**Cast** ${this.helpers.parseTypedNumber(ritual.cast)}`;
		if (ritual.secondaryCasters) {
			let secondaryLine: string[] = [ritual.secondaryCasters.number.toString()];
			if (ritual.secondaryCasters.note) secondaryLine.push(ritual.secondaryCasters.note);
			if (ritual.secondaryCasters.entry) secondaryLine.push(ritual.secondaryCasters.entry);
			castString += ` (${secondaryLine.join(', ')})`;
		}
		descriptionLines.push(castString);
	}
	if (ritual.cost) descriptionLines.push(`**Cost** ${ritual.cost}`);
	let primaryCheckConditionItems: string[] = [];
	if (ritual.primaryCheck.prof) primaryCheckConditionItems.push(ritual.primaryCheck.prof);
	if (ritual.primaryCheck.mustBe)
		primaryCheckConditionItems.push(`You must be a ${ritual.primaryCheck.mustBe.join(' or ')}`);
	descriptionLines.push(
		`**Primary Check** ${ritual.primaryCheck.skills.join(
			' or '
		)} ${`(${primaryCheckConditionItems.join('; ')})`}`.trim()
	);
	let secondaryCheckConditionItems: string[] = [];
	if (ritual.secondaryCheck) {
		if (ritual.secondaryCheck?.prof)
			secondaryCheckConditionItems.push(ritual.secondaryCheck.prof);
		descriptionLines.push(
			`**Secondary Checks** ${(ritual.secondaryCheck?.skills ?? []).join(' or ')} ${
				ritual.secondaryCheck?.prof ?? ''
			}`
				.trim()
				.replaceAll('  ', ' ')
		);
	}
	if (ritual.requirements) descriptionLines.push(`**Requirements** ${ritual.requirements}`);
	if (ritual.range) descriptionLines.push(`**Range** ${ritual.range.entry}`);
	if (ritual.area) descriptionLines.push(`**Area** ${ritual.area.entry}`);
	if (ritual.duration)
		descriptionLines.push(`**Duration** ${this.helpers.parseDuration(ritual.duration)}`);
	if (ritual.targets) descriptionLines.push(`**Targets** ${ritual.targets}`);
	descriptionLines.push('');
	descriptionLines.push(entryParser.parseEntries(ritual.entries));
	if (ritual.heightened) {
		descriptionLines.push('');
		if (ritual.heightened.X) {
			descriptionLines.push(
				Object.entries(ritual.heightened.X)
					.map(
						([level, effects]) =>
							`**Heightened** ${nth(Number(level))}: ${entryParser.parseEntries(
								effects
							)}`
					)
					.join('\n')
			);
		}
		if (ritual.heightened.plusX) {
			descriptionLines.push(
				Object.entries(ritual.heightened.plusX)
					.map(
						([level, effects]) =>
							`**Heightened** +${level}: ${entryParser.parseEntries(effects)}`
					)
					.join('\n')
			);
		}
	}
	return new KoboldEmbed({
		title: title,
		description: descriptionLines.join('\n'),
	});
}
