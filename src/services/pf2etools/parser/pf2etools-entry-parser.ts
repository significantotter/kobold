import _ from 'lodash';
import {
	AbilityEntry,
	AfflictionEntry,
	AttackEntry,
	Entry,
	SuccessDegreeEntry,
} from '../models/index.js';
import { Pf2eToolsModel } from '../pf2eTools.model.js';
import { SharedParsers, applyOperatorIfNumber } from './pf2etools-parser-helpers.js';

export class EntryParser {
	helpers: SharedParsers;
	constructor(
		private model: Pf2eToolsModel,
		private emojiConverter: { (emoji: string): string }
	) {
		this.helpers = new SharedParsers(this.model, this.emojiConverter);
	}

	public parseEntry(entry: Entry): string {
		if (_.isString(entry)) return entry;
		if (entry.type === 'successDegree')
			return this.parseSuccessDegree(entry as SuccessDegreeEntry);
		if (entry.type === 'affliction') return this.parseAfflictionEntry(entry as AfflictionEntry);
		if (entry.type === 'ability') return this.parseAbilityEntry(entry as AbilityEntry);
		if (entry.type === 'attack') return this.parseAttackEntry(entry);
		return '';
	}

	public parseSuccessDegree(entry: SuccessDegreeEntry) {
		let successDegreeString = '';
		if (entry.entries['Critical Success']) {
			successDegreeString += `**Critical Success** ${entry.entries['Critical Success']}\n`;
		}
		if (entry.entries['Success']) {
			successDegreeString += `**Success** ${entry.entries['Success']}\n`;
		}
		if (entry.entries['Failure']) {
			successDegreeString += `**Failure** ${entry.entries['Failure']}\n`;
		}
		if (entry.entries['Critical Failure']) {
			successDegreeString += `**Critical Failure** ${entry.entries['Critical Failure']}\n`;
		}
		return `\n${successDegreeString}}`;
	}

	public parseAbilityEntry(ability: AbilityEntry) {
		let abilityString = '';
		if (ability.name) {
			abilityString += `**${ability.name}** `;
		}
		if (ability.activity) {
			abilityString += this.helpers.parseActivity(ability.activity);
		}
		if (ability.traits) {
			abilityString += ` (${ability.traits.join(', ')})`;
		}
		if (ability.cost) {
			abilityString += ` **Cost** ${ability.cost}`;
		}
		if (ability.requirements) {
			abilityString += ` **Requirements** ${ability.requirements}`;
		}
		if (ability.entries?.length) abilityString += ' **Effect** ';
		for (const entry of ability.entries ?? []) {
			abilityString += this.parseEntry(entry);
		}
		return abilityString;
	}

	public parseAfflictionEntry(affliction: AfflictionEntry): string {
		let afflictionString = '';
		if (affliction.name) {
			afflictionString += `**${affliction.name}** `;
		}
		if (affliction.traits) {
			afflictionString += ` (${affliction.traits.join(', ')})`;
		}
		if (affliction.note) {
			afflictionString += ` ${affliction.note}`;
		}
		if (affliction.DC || affliction.savingThrow) afflictionString += ' **Saving Throw**';
		if (affliction.DC) {
			afflictionString += ` ${affliction.DC}`;
		}
		if (affliction.savingThrow) {
			afflictionString += ` ${affliction.savingThrow}`;
		}
		const afflictionStringSegments: string[] = [];
		afflictionStringSegments.push(afflictionString);
		if (affliction.onset) {
			afflictionStringSegments.push(`**Onset** ${affliction.onset}`);
		}
		if (affliction.maxDuration) {
			afflictionStringSegments.push(`**Maximum Duration** ${affliction.maxDuration}`);
		}
		for (const stage of affliction.stages ?? []) {
			let stageString = `**Stage ${stage.stage}**`;
			if (stage.entries?.length) {
				const entries = stage.entries.map(entry => this.parseEntry(entry));
				if (stage.entry) entries.push(this.parseEntry(stage.entry));
				stageString += entries.join(', ');
			}
			if (stage.duration) {
				stageString += ` (${stage.duration})`;
			}
			afflictionStringSegments.push(stageString);
		}
		const footer = affliction.temptedCurse
			? `\n**Tempted Curse** ${affliction.temptedCurse.join(', ')}`
			: '';
		return afflictionStringSegments.join('; ') + footer;
	}

	public parseAttackEntry(attack: AttackEntry) {
		let attackString = '';
		const traits = [
			...(attack.traits ?? []),
			attack.preciousMetal,
			attack.reload ? `reload ${attack.reload}` : undefined,
		]
			.flat()
			.filter(_.isString);
		if (attack.range) {
			if (_.isNumber(attack.range) && attack.range > 5) {
				attackString += `**Ranged** ${attack.range}} ft.}`;
			} else if (_.isNumber(attack.range) && attack.range <= 5) {
				attackString += `**Melee**`;
			} else {
				attackString += `**${attack.range}**`;
			}
		}
		if (attack.activity) {
			attackString += ' ' + this.helpers.parseActivity(attack.activity);
		}
		if (attack.attack) {
			attackString += ` ${applyOperatorIfNumber(attack.attack)} `;
		}
		if (traits?.length) {
			attackString += ` (${traits.join(', ').replaceAll(/[\<\>]/g, '')})`;
		}
		if (attack.damage) {
			let attackString = ', **Damage**: ';
			if (_.isArray(attack.damage)) {
				attackString += attack.damage.join(', ');
			} else {
				attackString += attack.damage;
			}
			if (
				attack.damageType &&
				![attack.damage]
					.flat()
					.map(_.lowerCase)
					.join(' ')
					.includes(attack.damageType.toLowerCase())
			) {
				attackString += ` ${attack.damageType}`;
			}
		}
		if (attack.damage2) {
			let attackString = ', ';
			if (_.isArray(attack.damage2)) {
				attackString += attack.damage2.join(', ');
			} else {
				attackString += attack.damage2;
			}
			if (
				attack.damageType2 &&
				![attack.damage]
					.flat()
					.map(_.lowerCase)
					.join(' ')
					.includes(attack.damageType2.toLowerCase())
			) {
				attackString += ` ${attack.damageType2}`;
			}
		}
		if (attack.traitNote) {
			attackString += ` ${attack.traitNote}`;
		}
		if (attack.note) {
			attackString += ` ${attack.note}`;
		}
		if (attack.effects) {
			attackString += ` Effects: ${attack.effects.map(entry => this.parseEntry(entry))}`;
		}
		return attackString;
	}
}
