import _ from 'lodash';
import {
	AbilityEntry,
	AfflictionEntry,
	AttackEntry,
	DataEntry,
	Entry,
	ImageEntry,
	LevelEffectEntry,
	Pf2EKeyAbility,
	Pf2eOptions,
	QuoteEntry,
	RefEntry,
	SemanticEntry,
	SuccessDegreeEntry,
	TableEntry,
	TableGroupEntry,
} from '../models/index.js';
import { CompendiumModel } from '../compendium.model.js';
import { SharedParsers, applyOperatorIfNumber } from './compendium-parser-helpers.js';
import { AttachmentBuilder } from 'discord.js';

export class EntryParser {
	helpers: SharedParsers;
	constructor(
		private model: CompendiumModel,
		private emojiConverter: { (emoji: string): string },
		private files: AttachmentBuilder[] = []
	) {
		this.helpers = new SharedParsers(this.model, this.emojiConverter);
	}

	public parseEntry(entry: Entry): string {
		if (_.isString(entry)) return entry;
		else if (entry.type === 'successDegree')
			return this.parseSuccessDegree(entry as SuccessDegreeEntry);
		else if (entry.type === 'affliction')
			return this.parseAfflictionEntry(entry as AfflictionEntry);
		else if (entry.type === 'ability') return this.parseAbilityEntry(entry as AbilityEntry);
		else if (entry.type === 'attack') return this.parseAttackEntry(entry as AttackEntry);
		else if (entry.type === 'quote') return this.parseQuoteEntry(entry as QuoteEntry);
		else if (entry.type === 'lvlEffect')
			return this.parseLevelEffectEntry(entry as LevelEffectEntry);
		else if (entry.type === 'pf2-options')
			return this.parsePf2eOptionsEntry(entry as Pf2eOptions);
		else if (entry.type === 'data') return this.parseDataEntry(entry as DataEntry);
		else if (entry.type === 'image') return this.parseImageEntry(entry as ImageEntry);
		else if (entry.type === 'table') return this.parseTableEntry(entry as TableEntry);
		else if (entry.type === 'tableGroup')
			return this.parseTableGroupEntry(entry as TableGroupEntry);
		else if (entry.type === 'pf2-key-ability')
			return this.parsePf2KeyAbilityEntry(entry as Pf2EKeyAbility);
		else if (entry.type === 'refClassFeature') return this.parseRefEntry(entry as RefEntry);
		else if (
			[
				'list',
				'entries',
				'section',
				'text',
				'item',
				'homebrew',
				'entriesOtherSource',
				'pf2-h1',
				'pf2-h1-flavor',
				'pf2-h2',
				'pf2-h3',
				'pf2-h4',
				'pf2-h5',
				'pf2-inset',
				'pf2-beige-box',
				'pf2-brown-box',
				'pf2-red-box',
				'pf2-sample-box',
				'pf2-tips-box',
				'pf2-key-box',
				'pf2-sidebar',
				'pf2-title',
				'inline',
				'hr',
				'paper',
			].includes(entry.type ?? '')
		)
			return this.parseSemanticEntry(entry as SemanticEntry);
		else return this.parseAbilityEntry(entry as AbilityEntry);
	}

	public parseImageEntry(entry: ImageEntry) {
		// This only exists in "Book" resources and has local image file refs.
		// 100% not worth the effort to implement.
		return '';
	}
	public parsePf2KeyAbilityEntry(entry: Pf2EKeyAbility) {
		// This is used a single time, only in the render demo.
		return '';
	}

	public parseTableEntry(tableEntry: TableEntry) {
		// Also not worth it.
		return '';
	}
	public parseTableGroupEntry(tableGroupEntry: TableGroupEntry) {
		// Also not worth it.
		return '';
	}

	public parsePf2eOptionsEntry(entry: Pf2eOptions) {
		return entry.items.map(this.parseEntry).join('\n');
	}

	public parseDataEntry(entry: DataEntry) {
		// TODO:
		return '';
	}

	public parseLevelEffectEntry(entry: LevelEffectEntry) {
		return entry.entries
			.map(level => {
				return `**${level.range}** ${level.entry}`;
			})
			.join('\n');
	}

	public parseSemanticEntry(entry: SemanticEntry) {
		let semanticString = '';
		if (entry.step) {
			semanticString += `**Step ${entry.step}** `;
		}
		if (entry.name) {
			semanticString += `**${entry.name}** `;
		}
		if (entry.level) {
			semanticString += ` (Level ${entry.level})`;
		}
		if (entry.traits) {
			semanticString += ` (${entry.traits.join(', ')})`;
		}
		if (entry.entries) {
			semanticString += entry.entries.map(this.parseEntry).join('\n');
		}
		return semanticString;
	}

	public parseQuoteEntry(entry: QuoteEntry): string {
		let semanticString = '';
		if (entry.from) {
			semanticString += `from ${entry.from}\n`;
		}
		semanticString = entry.entries.map(this.parseEntry).join('\n');
		if (entry.by) {
			semanticString += `${semanticString}\n-- ${entry.by}`;
		}
		return semanticString;
	}

	public parseRefEntry(entry: RefEntry): string {
		// Todo if I parse class features/classes
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
		if (entry.entries.Special) {
			successDegreeString += `**Special** ${entry.entries.Special}\n`;
		}
		return `\n${successDegreeString}`;
	}

	public parseAbilityEntry(ability: AbilityEntry, inline = true) {
		let abilityString = '';
		if ((ability.title ?? ability.name) && inline) {
			abilityString += `**${ability.title ?? ability.name}** `;
		}
		if (ability.activity && inline) {
			abilityString += this.helpers.parseActivity(ability.activity);
		}
		if (ability.traits) {
			abilityString += ` (${ability.traits.join(', ')})`;
			if (!inline) abilityString += '\n';
		}
		const delimiter = inline ? ' ' : '\n';
		if (ability.note) {
			abilityString += ` ${ability.note}`;
		}
		if (ability.components) {
			abilityString += ` ${ability.components.join(', ')}`;
		}
		if (ability.cost) {
			abilityString += `${delimiter}**Cost** ${ability.cost}`;
		}
		if (ability.prerequisites) {
			abilityString += `${delimiter}**Prerequisites** ${ability.prerequisites}`;
		}
		if (ability.trigger) {
			abilityString += `${delimiter}**Trigger** ${ability.trigger}`;
		}
		if (ability.requirements ?? ability.requirement) {
			abilityString += `${delimiter}**Requirements** ${
				ability.requirements ?? ability.requirement
			}`;
		}
		if (ability.frequency) {
			abilityString += delimiter + this.helpers.parseFrequency(ability.frequency);
		}
		if (ability.area) {
			abilityString += `${delimiter}**Area** ${ability.area.entry} (${ability.area.types.join(
				', '
			)})`;
		}
		// ignore range, it's only used on generic abilities attached to attacks
		// ignore entries_as_xyz, it repeats the data of another source of the ability
		// ignore generic, it tells you where to find the text of a common ability
		// ignore actionType, it's only used in archetypes/ancestries to reference the action source

		if (ability.entries?.length) abilityString += delimiter + '**Effect** ';
		for (const entry of ability.entries ?? []) {
			abilityString += this.parseEntry(entry);
		}
		if (ability.special) abilityString += `;${delimiter}**Special** ${ability.special}`;
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
				attackString += `**Ranged** ${attack.range} ft.}`;
			} else if (_.isNumber(attack.range) && attack.range <= 5) {
				attackString += `**Melee**`;
			} else {
				attackString += `**${attack.range}**`;
			}
		}
		if (attack.activity) {
			attackString += ' ' + this.helpers.parseActivity(attack.activity);
		}
		const toHit: number | undefined = attack.attack ?? attack.bonus;
		if (toHit) {
			attackString += ` ${applyOperatorIfNumber(toHit)} `;
		}
		if (traits?.length) {
			attackString += ` (${traits.join(', ').replaceAll(/[\<\>]/g, '')})`;
		}
		if (attack.damage) {
			attackString += ', **Damage**: ';
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
			attackString += ', ';
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
