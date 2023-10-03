import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Organization } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';

export async function parseOrganization(
	this: CompendiumEmbedParser,
	organization: Organization
): Promise<KoboldEmbed> {
	const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
	const descriptionLines: string[] = [];
	descriptionLines.push(`**Traits** ${organization.traits.join(', ')}`);
	descriptionLines.push(`**Title** ${organization.title.join(', ')}`);
	descriptionLines.push(`**Scope and Influence** ${organization.scope.join(', ')}`);
	descriptionLines.push(`**Goals** ${organization.goals.join(', ')}`);
	descriptionLines.push('');
	descriptionLines.push(`**Headquarters** ${organization.headquarters.join(', ')}`);
	descriptionLines.push(`**Locations** ${organization.keyMembers.join(', ')}`);
	descriptionLines.push(`**Allies** ${organization.allies.join(', ')}`);
	descriptionLines.push(`**Enemies** ${organization.enemies.join(', ')}`);
	descriptionLines.push(`**Assets** ${organization.assets.join(', ')}`);
	descriptionLines.push('');
	descriptionLines.push(`**Membership Requirements** ${organization.requirements.join(', ')}`);
	let alignmentString = `**Accepted Alignments** `;
	for (const alignmentGroup of organization.followerAlignment) {
		if (alignmentGroup.main) alignmentString += alignmentGroup.main;
		if (alignmentGroup.secondary?.length)
			alignmentString += ` (${alignmentGroup.secondary
				.concat(alignmentGroup.secondaryCustom ? [alignmentGroup.secondaryCustom] : [])
				.join(', ')})`;
		if (alignmentGroup.note) alignmentString += ` (${alignmentGroup.note})`;
		if (alignmentGroup.entry) alignmentString += ` ${alignmentGroup.entry}; `;
	}
	descriptionLines.push(alignmentString);
	descriptionLines.push(`**Values** ${organization.values.join(', ')}`);
	descriptionLines.push(`**Anathema** ${organization.anathema.join(', ')}`);

	const title = `${organization.name}`;
	return new KoboldEmbed({
		title: title,
	});
}
