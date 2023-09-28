import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { Creature, CreatureSense } from '../models/index.js';
import { Pf2eToolsModel } from '../pf2eTools.model.js';
import _ from 'lodash';
import { SharedParsers } from './pf2etools-parser-helpers.js';
import { EntryParser } from './pf2etools-entry-parser.js';

export class Pf2eToolsEmbedParser {
	private helpers: SharedParsers;
	private entries: EntryParser;
	constructor(
		private model: Pf2eToolsModel,
		private emojiConverter: { (emoji: string): string }
	) {
		this.helpers = new SharedParsers(this.model, this.emojiConverter);
		this.entries = new EntryParser(this.model, this.emojiConverter);
	}
	public async parseCreature(creature: Creature): Promise<KoboldEmbed> {
		const fluffResults = await this.model.creaturesFluff.collection
			.query()
			.equalTo('name', creature.name)
			.find();
		const fluffResult = fluffResults[0];

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
						if (ability.type === 'affliction') {
							return `**${ability.name}** ${(ability.entries ?? []).join(', ')}`;
						} else {
							return `${this.entries.parseAbilityEntry(ability)}`;
						}
					})
					.join('\n')
			);
		}

		const embed = new KoboldEmbed({
			title: title,
			url: `https://pf2etools.com/bestiary.html#${encodeURIComponent(creature.name)}${
				creature.source ? `_${encodeURIComponent(creature.source)}` : ''
			}`,
			thumbnail: fluffResult?.images?.[0] ? { url: fluffResult.images[0] } : undefined,
			description: topBlock.join('\n'),
		});

		const midBlock: string[] = [];
		if (creature.defenses) {
			midBlock.push(this.helpers.parseDefenses(creature.defenses));
		}
		if (creature.abilities?.mid) {
			midBlock.push(
				creature.abilities.mid
					.map(ability => {
						if (ability.type === 'affliction') {
							return `**${ability.name}** ${(ability.entries ?? []).join(', ')}`;
						} else {
							return `${this.entries.parseAbilityEntry(ability)}`;
						}
					})
					.join('\n')
			);
		}
		const bottomBlock: string[] = [];
		if (creature.speed) {
			const speeds = this.helpers.parseSpeed(creature.speed);
			if (speeds.length) bottomBlock.push(speeds);
		}
		for (const attack of creature.attacks ?? []) {
			if (attack) {
				midBlock.push(this.entries.parseAttackEntry(attack));
			}
		}
		if (creature.spellcasting?.length) {
			bottomBlock.push(
				creature.spellcasting
					.map(spellcasting => {
						return this.helpers.parseSpellcasting(spellcasting);
					})
					.filter(_.isString)
					.join('\n')
			);
		}
		if (creature.abilities?.bot) {
			bottomBlock.push(
				creature.abilities.bot
					.map(ability => {
						if (ability.type === 'affliction') {
							return this.entries.parseAfflictionEntry(ability);
						} else {
							return this.entries.parseAbilityEntry(ability);
						}
					})
					.join('\n')
			);
		}

		embed.addFields(
			{
				name: '\u200B',
				value: midBlock.join('\n'),
			},
			{
				name: '\u200B',
				value: bottomBlock.join('\n'),
			}
		);

		return embed;
	}
}
