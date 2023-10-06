import { EmbedData } from 'discord.js';
import { Organization, OrganizationFluff } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';
import { DrizzleUtils } from '../../utils/drizzle-utils.js';

export async function _parseOrganization(this: CompendiumEmbedParser, organization: Organization) {
	const preprocessedData = (await this.preprocessData(organization)) as Organization;

	// Organization Async Work
	const organizationFluffRaw = await this.model.db.query.OrganizationsFluff.findFirst({
		where: DrizzleUtils.ilike(this.model.organizationsFluff.table.name, organization.name),
	});
	const organizationFluff = (await this.preprocessData(organizationFluffRaw?.data)) as
		| OrganizationFluff
		| undefined;

	return parseOrganization.call(this, preprocessedData, organizationFluff);
}

export function parseOrganization(
	this: CompendiumEmbedParser,
	organization: Organization,
	organizationFluff?: OrganizationFluff
): EmbedData {
	const entryParser = new EntryParser({ delimiter: '\n', emojiConverter: this.emojiConverter });
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
	if (organizationFluff?.entries?.length) {
		descriptionLines.push('');
		descriptionLines.push(entryParser.parseEntries(organizationFluff.entries));
	}
	descriptionLines.push('');

	const title = `${organization.name}`;
	return {
		title: title,
		description: descriptionLines.join('\n'),
	};
}
