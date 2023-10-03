import _ from 'lodash';
import { KoboldEmbed } from '../../../../utils/kobold-embed-utils.js';
import { Ability, Affliction, Creature, CreatureFluff, CreatureSense } from '../../models/index.js';
import { CompendiumEmbedParser } from '../compendium-parser.js';
import { EntryParser } from '../compendium-entry-parser.js';
import { DrizzleUtils } from '../../utils/drizzle-utils.js';

const abilityIsAffliction = (ability: Ability | Affliction): ability is Affliction =>
	ability.type === 'affliction' || ability.type === 'Disease' || ability.type === 'Curse';

export async function parseCreature(
	this: CompendiumEmbedParser,
	creature: Creature
): Promise<KoboldEmbed> {
	const delimiter = '\n';
	const entryParser = new EntryParser(this.helpers, { delimiter });
	const inlineEntryParser = new EntryParser(this.helpers, { delimiter: '; ' });
	const fluffResultRaw = await this.model.db.query.CreaturesFluff.findFirst({
		where: DrizzleUtils.ilike(this.model.creaturesFluff.table.name, creature.name),
	});
	const fluffResult = fluffResultRaw?.data as CreatureFluff | undefined;

	let title = creature.name;
	if (creature.level) {
		title += ` -- Level ${creature.level}`;
	}
	if (creature.source) {
		title += ` (${creature.source})`;
	}

	const topBlock: string[] = [];
	if (creature.traits?.length) {
		topBlock.push(`**Traits:** ${creature.traits.join(', ')}`);
	}
	if (creature.description) {
		topBlock.push(creature.description);
	}
	if (creature.perception || creature.senses?.length) {
		let perceptionLine = '';
		if (creature.perception)
			perceptionLine += `**Perception:** ${this.helpers.parseStat(creature.perception)}`;
		if (creature.senses && creature.senses.length) {
			perceptionLine += ` ${creature.senses
				.map((sense: CreatureSense) => this.helpers.parseSense(sense))
				.join(', ')}`;
		}
		if (perceptionLine.length) topBlock.push(perceptionLine);
	}

	if (creature.languages) {
		const languages = this.helpers.parseLanguages(creature.languages);
		if (languages.length) topBlock.push(languages);
	}

	if (creature.skills && creature.skills.length) {
		if (creature.skills?.notes?.length) {
			topBlock.push(`**Skills:** ${creature.skills.notes.join(', ')}`);
		} else {
			const actualSkills = _.omit(creature.skills, ['notes']);
			const skills = Object.keys(actualSkills).map(key => {
				return `${key} ${this.helpers.parseStat(actualSkills[key])}`;
			});
			topBlock.push(`**Skills:** ${skills.join(', ')}`);
		}
	}

	if (creature.abilityMods) {
		const attributes = this.helpers.parseAttributes(creature.abilityMods);
		if (attributes.length) topBlock.push(attributes);
	}

	if (creature.items?.length) {
		topBlock.push(`**Items:** ${creature.items.join(', ')}`);
	}
	if (creature.abilities?.top) {
		topBlock.push(
			creature.abilities.top
				.map(ability => {
					if (abilityIsAffliction(ability)) {
						return `**${ability.name}** ${(ability.entries ?? []).join(', ')}`;
					} else {
						return inlineEntryParser
							.parseAbilityEntry(ability)
							.replace('**', '')
							.replace('**', '')
							.replace('; **Effect**', ' ');
					}
				})
				.filter(_.identity)
				.join(delimiter)
		);
	}

	const embed = new KoboldEmbed({
		title: title,
		url: `https://pf2etools.com/bestiary.html#${encodeURIComponent(creature.name)}${
			creature.source ? `_${encodeURIComponent(creature.source)}` : ''
		}`,
		thumbnail: fluffResult?.images?.[0] ? { url: fluffResult.images[0] } : undefined,
		description: topBlock.join(delimiter),
	});

	const midBlock: string[] = [];
	if (creature.defenses) {
		midBlock.push(this.helpers.parseDefenses(creature.defenses));
	}
	if (creature.abilities?.mid) {
		midBlock.push(
			creature.abilities.mid
				.map(ability => {
					if (abilityIsAffliction(ability)) {
						return `**${ability.name}** ${(ability.entries ?? []).join(', ')}`;
					} else {
						return `${entryParser.parseAbilityEntry(ability)}`;
					}
				})
				.filter(_.identity)
				.join(delimiter)
		);
	}
	const bottomBlock: string[] = [];
	if (creature.speed) {
		const speeds = this.helpers.parseSpeed(creature.speed);
		if (speeds.length) bottomBlock.push(speeds);
	}
	for (const attack of creature.attacks ?? []) {
		if (attack) {
			midBlock.push(inlineEntryParser.parseAttackEntry(attack));
		}
	}
	if (creature.spellcasting?.length) {
		bottomBlock.push(
			creature.spellcasting
				.map(spellcasting => {
					return this.helpers.parseSpellcasting(spellcasting);
				})
				.filter(_.identity)
				.join(delimiter)
		);
	}
	if (creature.abilities?.bot) {
		bottomBlock.push(
			creature.abilities.bot
				.map(ability => {
					if (abilityIsAffliction(ability)) {
						return entryParser.parseAfflictionEntry(ability);
					} else {
						return entryParser.parseAbilityEntry(ability);
					}
				})
				.filter(_.identity)
				.join(delimiter)
		);
	}

	embed.addFields(
		{
			name: '\u200B',
			value: midBlock.join(delimiter),
		},
		{
			name: '\u200B',
			value: bottomBlock.join(delimiter),
		}
	);

	return embed;
}
