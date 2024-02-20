import type { EmbedData } from 'discord.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';

import { DrizzleUtils } from '../../utils/drizzle-utils.js';
import { nth } from '../compendium-parser-helpers.js';
import _ from 'lodash';
import { Deity, DeityFluff } from '../../schemas/index.js';

export async function _parseDeity(this: CompendiumEmbedParser, deity: Deity) {
	const preprocessedData = (await this.preprocessData(deity)) as Deity;

	// Deity async work
	const deityFluff = (
		await this.model.db.query.DeitiesFluff.findFirst({
			where: DrizzleUtils.ilike(this.model.deitiesFluff.table.name, deity.name),
		})
	)?.data as DeityFluff | undefined;

	return parseDeity.call(this, preprocessedData, deityFluff);
}

export function parseDeity(
	this: CompendiumEmbedParser,
	deity: Deity,
	deityFluff: DeityFluff | undefined
): EmbedData {
	let title = `${deity.name}`;
	if (deity.alias?.length) title += ` (${deity.alias.join(', ')})`;
	if (deity.alignment?.alignment?.length)
		title += ` ${deity.alignment.alignment.map(n => n.toUpperCase()).join(', ')}`;

	const descriptionLines: string[] = [];
	let thumbnail: string | undefined = undefined;
	if (deityFluff) {
		thumbnail = deityFluff.images?.[0];
		descriptionLines.push(
			this.entryParser.parseEntries(deityFluff.entries ?? deityFluff.lore ?? [])
		);
		descriptionLines.push(''); //extra spacing
	}
	descriptionLines.push(`**Category:** ${deity.category}`);
	if (deity.edicts?.length) descriptionLines.push(`**Edicts:** ${deity.edicts.join(', ')}`);
	if (deity.anathema?.length) descriptionLines.push(`**Anathema:** ${deity.anathema.join(', ')}`);
	if (deity.areasOfConcern?.length)
		descriptionLines.push(`**Areas of Concern:** ${deity.areasOfConcern.join(', ')}`);
	if (deity.alignment?.entry) descriptionLines.push(`**Alignment:** ${deity.alignment.entry}`);
	if (deity.alignment?.followerAlignment?.length) {
		descriptionLines.push(
			`**Follower Alignment:** ${deity.alignment.followerAlignment.join(', ')}`
		);
	}
	if (deity.pantheonMembers)
		descriptionLines.push(
			`**Pantheon Members:** ${deity.pantheonMembers
				.map(member => member.split('|')[0])
				.join(', ')}`
		);

	const devoteeBenefitLines: string[] = [];
	if (deity.divineAbility) {
		let divineAbilityString = '**Divine Ability:** ';
		divineAbilityString +=
			deity.divineAbility.entry ?? (deity.divineAbility?.abilities ?? []).join(' or ');
		devoteeBenefitLines.push(divineAbilityString);
	}
	if (deity.font) devoteeBenefitLines.push(`**Divine Font:** ${deity.font.join(', ')}`);
	if (deity.divineSkill) {
		devoteeBenefitLines.push(
			`**Divine Skill:** ${(deity.divineSkill.skills ?? []).join(', ')}${
				deity.divineSkill.entry ? ` ${deity.divineSkill.entry}` : ''
			}`
		);
	}
	if (deity.favoredWeapon) {
		devoteeBenefitLines.push(
			`**Favored Weapon:** ${(deity.favoredWeapon.weapons ?? []).join(', ')}${
				deity.favoredWeapon.entry ? ` ${deity.favoredWeapon.entry}` : ''
			}`
		);
	}
	if (deity.domains) devoteeBenefitLines.push(`**Domains:** ${deity.domains.join(', ')}`);
	if (deity.alternateDomains)
		devoteeBenefitLines.push(`**Alternate Domains:** ${deity.alternateDomains.join(', ')}`);
	if (deity.spells) {
		devoteeBenefitLines.push(
			`**Cleric Spells:** ${Object.entries(deity.spells)
				.map(([spellLevel, spells]) => {
					const parsedSpells = [spells]
						.flat(2)
						.map(spell => spell.split('|')[0])
						.join(', ');
					return `${nth(Number(spellLevel))}: ${parsedSpells}`;
				})
				.join(', ')}`
		);
	}

	const divineIntercessionLines = [];
	if (deity.intercession) {
		divineIntercessionLines.push(`${deity.intercession.flavor.join('\n')}`);
		divineIntercessionLines.push('');
		if (deity.intercession['Minor Boon'])
			divineIntercessionLines.push(
				`**Minor Boon:** ${deity.intercession['Minor Boon'].join('\n')}`
			);
		if (deity.intercession['Moderate Boon'])
			divineIntercessionLines.push(
				`**Moderate Boon:** ${deity.intercession['Moderate Boon'].join('\n')}`
			);
		if (deity.intercession['Major Boon'])
			divineIntercessionLines.push(
				`**Major Boon:** ${deity.intercession['Major Boon'].join('\n')}`
			);
		divineIntercessionLines.push('');
		if (deity.intercession['Minor Curse'])
			divineIntercessionLines.push(
				`**Minor Curse:** ${deity.intercession['Minor Curse'].join('\n')}`
			);
		if (deity.intercession['Moderate Curse'])
			divineIntercessionLines.push(
				`**Moderate Curse:** ${deity.intercession['Moderate Curse'].join('\n')}`
			);
		if (deity.intercession['Major Curse'])
			divineIntercessionLines.push(
				`**Major Curse:** ${deity.intercession['Major Curse'].join('\n')}`
			);
	}

	const fields: { name: string; value: string; inline?: boolean }[] = [];
	if (devoteeBenefitLines.length)
		fields.push({ name: '**Devotee Benefits**', value: devoteeBenefitLines.join('\n') });
	if (divineIntercessionLines.length)
		fields.push({ name: '**Divine Intercession**', value: divineIntercessionLines.join('\n') });

	return {
		title: title,
		description: descriptionLines.join('\n'),
		fields,
		image: thumbnail ? { url: thumbnail } : undefined,
	};
}
