import _ from 'lodash';
import {
	AbilityEntry,
	AfflictionEntry,
	AttackEntry,
	DataEntry,
	Entry,
	Feat,
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
import { SharedParsers, applyOperatorIfNumber } from './compendium-parser-helpers.js';
import { table } from 'table';

export class EntryParser {
	helpers: SharedParsers;
	delimiter: string;
	constructor(
		parserHelper: SharedParsers,
		options: {
			delimiter?: string;
		}
	) {
		this.delimiter = options.delimiter ?? ', ';
		this.helpers = parserHelper;
	}

	public parseEntry(entry: Entry, showTitle: boolean = true): string {
		if (_.isString(entry)) return entry;
		else if (entry.type === 'successDegree')
			return this.parseSuccessDegree(entry as SuccessDegreeEntry, showTitle);
		else if (entry.type === 'affliction')
			return this.parseAfflictionEntry(entry as AfflictionEntry, showTitle);
		else if (entry.type === 'ability')
			return this.parseAbilityEntry(entry as AbilityEntry, showTitle);
		else if (entry.type === 'attack')
			return this.parseAttackEntry(entry as AttackEntry, showTitle);
		else if (entry.type === 'quote')
			return this.parseQuoteEntry(entry as QuoteEntry, showTitle);
		else if (entry.type === 'lvlEffect')
			return this.parseLevelEffectEntry(entry as LevelEffectEntry, showTitle);
		else if (entry.type === 'pf2-options')
			return this.parsePf2eOptionsEntry(entry as Pf2eOptions, showTitle);
		else if (entry.type === 'data') return this.parseDataEntry(entry as DataEntry, showTitle);
		else if (entry.type === 'image')
			return this.parseImageEntry(entry as ImageEntry, showTitle);
		else if (entry.type === 'table')
			return this.parseTableEntry(entry as TableEntry, showTitle);
		else if (entry.type === 'tableGroup')
			return this.parseTableGroupEntry(entry as TableGroupEntry, showTitle);
		else if (entry.type === 'pf2-key-ability')
			return this.parsePf2KeyAbilityEntry(entry as Pf2EKeyAbility, showTitle);
		else if (entry.type === 'refClassFeature')
			return this.parseRefEntry(entry as RefEntry, showTitle);
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
			return this.parseSemanticEntry(entry as SemanticEntry, showTitle);
		else return this.parseAbilityEntry(entry as AbilityEntry, showTitle);
	}

	public parseEntries = (entries: Entry[], showTitle: boolean = true): string => {
		return (
			entries
				.map(entry => this.parseEntry(entry, showTitle))
				// remove any empty string results
				.filter(entry => entry && entry != this.delimiter)
				.join(this.delimiter)
		);
	};

	public parseImageEntry(entry: ImageEntry, showTitle: boolean = true): string {
		// This only exists in "Book" resources and has local image file refs.
		// 100% not worth the effort to implement.
		return '';
	}
	public parsePf2KeyAbilityEntry(entry: Pf2EKeyAbility, showTitle: boolean = true): string {
		// This is used a single time, only in the render demo.
		return '';
	}

	public parseTableEntry(tableEntry: TableEntry, showTitle: boolean = true): string {
		const entryParser = new EntryParser(this.helpers, { delimiter: '\n\n' });
		const tableRows = tableEntry.rows.map(row => {
			if (_.isArray(row)) return row.map(_.toString);
			else {
				const innerRows: string[] = [];
				for (let i = 0; i < row.rows.length; i++) {
					innerRows[i] = row.rows.map(innerRow => innerRow[i]).join(', ');
				}
				return row.rows.map(row => row.map(_.toString).join('; '));
			}
		});
		const colOptions = [];
		for (const col in tableRows[0]) {
			colOptions.push({
				width: Math.min(Math.max(...tableRows.map(row => row[col].length)), 18),
			});
		}
		const result = table(tableRows, {
			border: {
				topLeft: ``,
				topRight: ``,
				bottomLeft: ``,
				bottomRight: ``,
				bodyLeft: ``,
				bodyRight: ``,
				joinLeft: ``,
				joinRight: ``,
			},
		});
		return '```' + result + '```';
	}
	public parseTableGroupEntry(
		tableGroupEntry: TableGroupEntry,
		showTitle: boolean = true
	): string {
		// Also not worth it.
		return '';
	}

	public parsePf2eOptionsEntry(entry: Pf2eOptions, showTitle: boolean = true): string {
		return this.parseEntries(entry.items);
	}

	public parseDataEntry(entry: DataEntry, showTitle: boolean = true): string {
		// TODO:
		return '';
	}

	public parseLevelEffectEntry(entry: LevelEffectEntry, showTitle: boolean = true): string {
		return entry.entries
			.map(level => {
				return `**${level.range}** ${level.entry}`;
			})
			.join(this.delimiter);
	}

	public parseSemanticEntry(entry: SemanticEntry, showTitle: boolean = true): string {
		let semanticLines: string[] = [];
		if (entry.step) {
			semanticLines.push(`**Step ${entry.step}** `);
		}
		if (entry.name) {
			semanticLines.push(`**${entry.name}** `);
		}
		if (entry.level) {
			semanticLines.push(` (Level ${entry.level})`);
		}
		if (entry.traits) {
			semanticLines.push(` (${entry.traits.join(', ')})`);
		}
		if (entry.entries) {
			semanticLines.push(this.parseEntries(entry.entries));
		}
		if (entry.items) {
			semanticLines.push(this.parseEntries(entry.items));
		}
		return semanticLines.join(this.delimiter);
	}

	public parseQuoteEntry(entry: QuoteEntry, showTitle: boolean = true): string {
		let semanticLines: string[] = [];
		if (entry.from) {
			semanticLines.push(`from ${entry.from}`);
		}
		semanticLines.push(this.parseEntries(entry.entries));
		if (entry.by) {
			semanticLines.push(
				`${this.delimiter.includes('\n') ? this.delimiter : ''}-- ${entry.by}`
			);
		}
		return semanticLines.join(this.delimiter);
	}

	public parseRefEntry(entry: RefEntry, showTitle: boolean = true): string {
		// Todo if I parse class features/classes
		return '';
	}

	public parseSuccessDegree(entry: SuccessDegreeEntry, showTitle: boolean = true): string {
		let successDegreeLines = [];
		if (entry.entries['Critical Success']) {
			successDegreeLines.push(`**Critical Success** ${entry.entries['Critical Success']}`);
		}
		if (entry.entries['Success']) {
			successDegreeLines.push(`**Success** ${entry.entries['Success']}`);
		}
		if (entry.entries['Failure']) {
			successDegreeLines.push(`**Failure** ${entry.entries['Failure']}`);
		}
		if (entry.entries['Critical Failure']) {
			successDegreeLines.push(`**Critical Failure** ${entry.entries['Critical Failure']}`);
		}
		if (entry.entries.Special) {
			successDegreeLines.push(`**Special** ${entry.entries.Special}`);
		}
		return this.delimiter + successDegreeLines.join(this.delimiter);
	}

	public parseAbilityEntryTitle(ability: AbilityEntry): string {
		let abilityTitle = `**${ability.title ?? ability.name ?? 'Activate'}** `;
		if (ability.activity) abilityTitle += this.helpers.parseActivity(ability.activity);
		return abilityTitle;
	}

	public parseAbilityEntry(ability: AbilityEntry, showTitle: boolean = true): string {
		const abilityLines: string[] = [];
		let abilityTitle = '';

		console.log(abilityTitle);
		let abilityTraitString = '';
		if (ability.traits) abilityTraitString += ` (${ability.traits.join(', ')})`;
		if (ability.note) abilityTraitString += ` ${ability.note}`;

		if (showTitle) abilityLines.push(this.parseAbilityEntryTitle(ability) + abilityTraitString);
		else if (abilityTraitString) abilityLines.push(abilityTraitString.trim());

		if (ability.components)
			abilityLines.push(`**Components** ${ability.components.join(', ')}`);

		if (ability.cost) abilityLines.push(`**Cost** ${ability.cost}`);

		if (ability.prerequisites) abilityLines.push(`**Prerequisites** ${ability.prerequisites}`);

		if (ability.trigger) abilityLines.push(`**Trigger** ${ability.trigger}`);

		if (ability.requirements ?? ability.requirement)
			abilityLines.push(`**Requirements** ${ability.requirements ?? ability.requirement}`);

		if (ability.frequency) abilityLines.push(this.helpers.parseFrequency(ability.frequency));

		if (ability.area)
			abilityLines.push(`**Area** ${ability.area.entry} (${ability.area.types.join(', ')})`);

		// ignore range, it's only used on generic abilities attached to attacks
		// ignore entries_as_xyz, it repeats the data of another source of the ability
		// ignore generic, it tells you where to find the text of a common ability
		// ignore actionType, it's only used in archetypes/ancestries to reference the action source
		if (ability.entries?.length) abilityLines.push(this.parseEntries(ability.entries));

		if (ability.special) abilityLines.push(`;**Special** ${ability.special}`);
		return abilityLines.join(this.delimiter);
	}

	public parseAfflictionEntry(affliction: AfflictionEntry, showTitle: boolean = true): string {
		let afflictionString = '';
		const afflictionLines: string[] = [];
		let afflictionTitle = '';
		if (affliction.name) afflictionTitle += `**${affliction.name}**`;

		let afflictionTraitString = '';
		if (affliction.traits) afflictionTraitString += ` (${affliction.traits.join(', ')})`;
		let afflictionNoteString = '';
		if (affliction.note) afflictionNoteString += ` ${affliction.note}`;

		if (showTitle) {
			afflictionLines.push(afflictionTitle + afflictionTraitString + afflictionNoteString);
		} else {
			if (afflictionTraitString) afflictionLines.push(afflictionTraitString.trim());
			if (afflictionNoteString) afflictionLines.push(afflictionNoteString.trim());
		}

		let savingThrowString = '';
		if (affliction.DC || affliction.savingThrow) savingThrowString += `**Saving Throw**`;
		if (affliction.DC) {
			savingThrowString += ` ${affliction.DC}`;
		}
		if (affliction.savingThrow) {
			savingThrowString += ` ${affliction.savingThrow}`;
		}
		if (savingThrowString) afflictionLines.push(savingThrowString);

		afflictionLines.push(afflictionString);
		if (affliction.onset) {
			afflictionLines.push(`**Onset** ${affliction.onset}`);
		}
		if (affliction.maxDuration) {
			afflictionLines.push(`**Maximum Duration** ${affliction.maxDuration}`);
		}
		for (const stage of affliction.stages ?? []) {
			let stageString = `**Stage ${stage.stage}**`;
			if (stage.duration) {
				stageString += ` (${stage.duration})`;
			}
			if (stage.entries?.length || stage.entry) {
				stageString +=
					this.delimiter +
					this.parseEntries(
						(stage.entries ?? []).concat(stage.entry ? [stage.entry] : [])
					);
			}
			afflictionLines.push(stageString);
		}
		if (affliction.entries?.length) {
			afflictionLines.push(this.parseEntries(affliction.entries));
		}
		if (affliction.temptedCurse)
			afflictionLines.push(`**Tempted Curse** ${affliction.temptedCurse.join(', ')}`);
		return afflictionLines.join(this.delimiter);
	}

	public parseAttackEntry(attack: AttackEntry, showTitle: boolean = true): string {
		const attackLine = [];
		const traits = [
			...(attack.traits ?? []),
			attack.preciousMetal,
			attack.reload ? `reload ${attack.reload}` : undefined,
		]
			.flat()
			.filter(_.isString);
		if (attack.range) {
			if (_.isNumber(attack.range) && attack.range > 5) {
				attackLine.push(`**Ranged** ${attack.range} ft.`);
			} else if (_.isNumber(attack.range) && attack.range <= 5) {
				attackLine.push(`**Melee**`);
			} else {
				attackLine.push(`**${attack.range}**`);
			}
		}
		attackLine.push(
			' ' + this.helpers.parseActivity(attack.activity ?? { number: 1, unit: 'action' })
		);
		attackLine.push(`${attack.name}`);
		const toHit: number | undefined = attack.attack ?? attack.bonus;
		if (toHit) {
			attackLine.push(`${applyOperatorIfNumber(toHit)} `);
		}
		if (traits?.length) {
			attackLine.push(`(${traits.join(', ').replaceAll(/[\<\>]/g, '')})`);
		}
		if (attack.damage) {
			let damageString = ', **Damage**: ';
			if (_.isArray(attack.damage)) {
				damageString += attack.damage.join(', ');
			} else {
				damageString += attack.damage;
			}
			if (
				attack.damageType &&
				![attack.damage]
					.flat()
					.map(_.lowerCase)
					.join(' ')
					.includes(attack.damageType.toLowerCase())
			) {
				damageString += `${attack.damageType}`;
			}
			if (attack.damage2) damageString += ', ';
			attackLine.push(damageString);
		}
		if (attack.damage2) {
			let damageString = '';
			if (_.isArray(attack.damage2)) {
				damageString += attack.damage2.join(', ');
			} else {
				damageString += attack.damage2;
			}
			if (
				attack.damageType2 &&
				![attack.damage]
					.flat()
					.map(_.lowerCase)
					.join(' ')
					.includes(attack.damageType2.toLowerCase())
			) {
				damageString += `${attack.damageType2}`;
			}
			attackLine.push(damageString);
		}
		if (attack.traitNote) {
			attackLine.push(`${attack.traitNote}`);
		}
		if (attack.note) {
			attackLine.push(`${attack.note}`);
		}
		if (attack.effects) {
			attackLine.push(
				`Effects: ${attack.effects
					.map(entry => this.parseEntry(entry))
					.filter(entry => entry != this.delimiter)
					.join(', ')}`
			);
		}
		return attackLine.join(' ');
	}

	parseFeat(feat: Feat, showTitle: boolean = true): { name: string; value: string } {
		const activity = feat.activity ? ' ' + this.helpers.parseActivity(feat.activity) : '';
		const name = `**${feat.name}**${activity} (Feat ${feat.level})`;

		const descriptionLines: string[] = [];
		if (showTitle) descriptionLines.push(name);
		if (feat.traits) descriptionLines.push(`**Traits** ${feat.traits.join(', ')}`);
		if (feat.frequency) descriptionLines.push(this.helpers.parseFrequency(feat.frequency));
		if (feat.access) descriptionLines.push(`**Access** ${feat.access}`);
		if (feat.cost) descriptionLines.push(`**Cost** ${feat.cost}`);
		if (feat.prerequisites) descriptionLines.push(`**Prerequisites** ${feat.prerequisites}`);
		if (feat.access) descriptionLines.push(`**Access** ${feat.access}`);

		if (feat.entries) descriptionLines.push(this.parseEntries(feat.entries));

		if (feat.amp?.entries) {
			descriptionLines.push(this.parseEntries(feat.amp.entries));
		}
		if (feat.leadsTo)
			descriptionLines.push(
				`**Leads To** ${feat.leadsTo.map(otherFeat => `__${otherFeat}__`).join(', ')}`
			);
		if (feat.footer)
			descriptionLines.push(
				Object.entries(feat.footer)
					.map((key, value) => `**${key}** ${value}`)
					.join(this.delimiter)
			);
		if (feat.special) descriptionLines.push(`**Special** ${feat.special.join('; ')}`);
		return { name, value: descriptionLines.join(this.delimiter) };
	}
}
