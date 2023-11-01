import _ from 'lodash';
import { EmbedData } from 'discord.js';
import {
	Ability,
	Affliction,
	Creature,
	CreatureFluff,
	CreatureSense,
} from '../../schemas/index.js';
import type { CompendiumEmbedParser } from '../compendium-parser.js';
import { DrizzleUtils } from '../../utils/drizzle-utils.js';

const abilityIsAffliction = (ability: Ability | Affliction): ability is Affliction =>
	ability.type === 'affliction' || ability.type === 'Disease' || ability.type === 'Curse';

export async function _parseCreature(this: CompendiumEmbedParser, creature: Creature) {
	const preprocessedData = (await this.preprocessData(creature)) as Creature;

	// Creature Async Work
	const fluffResultRaw = await this.model.db.query.CreaturesFluff.findFirst({
		where: DrizzleUtils.ilike(this.model.creaturesFluff.table.name, creature.name),
	});
	const fluffResult = fluffResultRaw?.data as CreatureFluff | undefined;

	return parseCreature.call(this, preprocessedData, fluffResult);
}

export function parseCreature(
	this: CompendiumEmbedParser,
	creature: Creature,
	fluffData: CreatureFluff | undefined
): EmbedData {
	const delimiter = '\n';
	const inlineEntryParser = this.entryParser.withDelimiter('; ');

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
						return `${this.entryParser.parseAbilityEntry(ability)}`;
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
						return this.entryParser.parseAfflictionEntry(ability);
					} else {
						return this.entryParser.parseAbilityEntry(ability);
					}
				})
				.filter(_.identity)
				.join(delimiter)
		);
	}

	return {
		title: title,
		url: `https://pf2etools.com/bestiary.html#${encodeURIComponent(creature.name)}${
			creature.source ? `_${encodeURIComponent(creature.source)}` : ''
		}`,
		thumbnail: fluffData?.images?.[0] ? { url: fluffData.images[0] } : undefined,
		description: topBlock.join(delimiter),
		fields: [
			{
				name: '\u200B',
				value: midBlock.join(delimiter),
			},
			{
				name: '\u200B',
				value: bottomBlock.join(delimiter),
			},
		],
	};
}
