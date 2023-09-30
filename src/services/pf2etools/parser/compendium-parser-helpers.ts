import _ from 'lodash';
import {
	Activity,
	Creature,
	CreatureSense,
	Defenses,
	Frequency,
	Speed,
	SpellLevel,
	Spellcasting,
	SpellcastingMap,
	Stat,
	TargetValueRecord,
	TypedNumber,
} from '../models/index.js';
import { CompendiumModel } from '../compendium.model.js';
import { AttachmentBuilder } from 'discord.js';

function nth(n: number) {
	if (isNaN(Number(n))) return n.toString();
	return n + (['st', 'nd', 'rd'][((((n + 90) % 100) - 10) % 10) - 1] || 'th');
}

// Replaces a reference block such as "{@damage 2d10+8}" with "2d10+8"
export function removeTextReference(text: string, referenceString: string) {
	const referenceRegex = new RegExp('\\{\\@' + referenceString + ' (.*?)\\}', 'g');
	return text.replaceAll(referenceRegex, '$1');
}
export function applyOperatorIfNumber(target: string | number): string {
	const targetAsNum = Number(target);
	if (_.isNumber(targetAsNum) && _.isFinite(targetAsNum)) {
		if (targetAsNum >= 0) {
			return `+${target}`;
		}
	}
	return target.toString();
}
export function parseActivityRaw(activity?: Activity) {
	if (!activity) return '';
	if ('entry' in activity) {
		return ``;
	}
	if (activity.unit === 'reaction') {
		return 'react';
	} else if (activity.unit === 'free') {
		return 'free';
	} else if (['action', 'actions'].includes(activity.unit)) {
		if (activity.number === 1) {
			return '1a';
		} else if (activity.number === 2) {
			return '2a';
		} else if (activity.number === 3) {
			return '3a';
		}
	}
	return ``;
}

export class SharedParsers {
	constructor(
		private model: CompendiumModel,
		private emojiConverter: { (emoji: string): string },
		private files: AttachmentBuilder[] = []
	) {}

	public parseSpellcastingLevel(spellcastingLevel: SpellLevel | undefined): string {
		if (spellcastingLevel == null) return '';
		let spellcastingLevelString = '';

		if (spellcastingLevel.slots) {
			spellcastingLevelString += ` (${spellcastingLevel.slots} slots)`;
		}
		let spellText: string[] = [];
		for (const spell of spellcastingLevel.spells ?? []) {
			let spellString = spell.name;
			if (spell.amount) {
				spellString += ` (${spell.amount})`;
			}
			if (spell.notes?.length) {
				spellString += ` (${spell.notes.join(', ')})`;
			}
			spellText.push(spellString);
		}
		spellcastingLevelString += spellText.join(', ');

		return spellcastingLevelString;
	}

	public parseSpellcasting(spellcasting: Spellcasting) {
		let spellcastingString = '';

		if (spellcasting.name) {
			spellcastingString += `**${spellcasting.name}**`;
		} else {
			if (spellcasting.tradition)
				spellcastingString += `**${_.capitalize(spellcasting.tradition)}**`;
			if (spellcasting.type) spellcastingString += ` **${_.capitalize(spellcasting.type)}**`;
			if (spellcastingString.length) spellcastingString += ' ';
			spellcastingString += '**Spells**';
		}
		if (spellcasting.attack) {
			spellcastingString += ` +${spellcasting.attack} to hit`;
		}
		if (spellcasting.DC) {
			spellcastingString += ` DC ${spellcasting.DC}`;
		}
		if (spellcasting.fp) {
			spellcastingString += `, ${spellcasting.fp} focus points`;
		}
		if (spellcasting.note) {
			spellcastingString += `, ${spellcasting.note}`;
		}
		spellcastingString += ';';

		if (spellcasting.entry) {
			const levels = _.keys(spellcasting.entry).sort((a, b) => Number(a) - Number(b));

			for (const spellcastingLevel of levels as (keyof SpellcastingMap)[]) {
				if (spellcastingLevel === 'constant') {
					let constantLevels: string[] = [];
					for (const constantLevel of _.keys(spellcasting.entry.constant).sort(
						(a, b) => Number(a) - Number(b)
					) as (keyof SpellcastingMap['constant'])[]) {
						constantLevels.push(
							`${nth(Number(constantLevel))} ${this.parseSpellcastingLevel(
								spellcasting.entry?.constant?.[constantLevel]
							)}`
						);
					}
					spellcastingString += ' **Constant** ' + constantLevels.join('; ');
				} else if (spellcastingLevel === '0') {
					const levelStrings: string[] = [];
					levelStrings.push(
						`**Cantrips** (${nth(
							spellcasting.entry?.[spellcastingLevel]?.level ?? 1
						)})${this.parseSpellcastingLevel(spellcasting.entry?.[spellcastingLevel])}`
					);
					spellcastingString += ' ' + levelStrings.join('; ');
				} else {
					const levelStrings: string[] = [];
					levelStrings.push(
						`**${nth(Number(spellcastingLevel))}** ${this.parseSpellcastingLevel(
							spellcasting.entry?.[spellcastingLevel]
						)}`
					);
					spellcastingString += ' ' + levelStrings.join('; ');
				}
			}
		}
		return spellcastingString;
	}

	public parseActivity(activity: Activity) {
		if (!activity) return '';
		if ('entry' in activity) {
			return `${activity.unit} ${activity.entry}`;
		}
		if (activity.unit === 'reaction') {
			return this.emojiConverter('reaction');
		} else if (activity.unit === 'free') {
			return this.emojiConverter('freeAction');
		} else if (['action', 'actions'].includes(activity.unit)) {
			if (activity.number === 1) {
				return this.emojiConverter('oneAction');
			} else if (activity.number === 2) {
				return this.emojiConverter('twoActions');
			} else if (activity.number === 3) {
				return this.emojiConverter('threeActions');
			}
		}
		return `${activity.number} ${activity.unit}`;
	}

	public parseFrequency(frequency: Frequency) {
		let frequencyString = '**Frequency** ';
		if ('special' in frequency) {
			return frequencyString + frequency.special;
		}
		if (_.isString(frequency.number)) frequencyString += ` ${frequency.number}`;
		else
			frequencyString += ` ${frequency.number}${
				frequency.number > 1 ? ' times' : ' time'
			} per`;

		if (frequency.interval) {
			frequencyString += ` ${frequency.interval} `;
		}
		if (frequency.unit ?? frequency.customUnit) {
			frequencyString += ` ${frequency.unit ?? frequency.customUnit}${
				(frequency?.interval ?? 0) > 1 ? 's' : ''
			}`;
		}
		return frequencyString;
	}

	public parseTypedNumber(typedNumber: TypedNumber | number | string) {
		if (_.isNumber(typedNumber)) {
			return typedNumber.toString();
		}
		if (_.isString(typedNumber)) {
			return typedNumber;
		}
		let builtNumber = '';
		if (typedNumber.number) {
			builtNumber = typedNumber.number.toString();
		} else if (typedNumber.entry) {
			builtNumber = typedNumber.entry;
		}
		if (typedNumber.unit ?? typedNumber.customUnit) {
			builtNumber += ` ${typedNumber.unit ?? typedNumber.customUnit}`;
		}
		return builtNumber;
	}
	public parseSense(sense: CreatureSense): string {
		let builtSense = '';
		if (sense.name) {
			builtSense += sense.name;
		}
		if (sense.type) {
			builtSense += ` (${sense.type})`;
		}
		const range = sense.range ?? sense.number;
		if (range) {
			builtSense += ` ${this.parseTypedNumber(range)}`;
		}
		if (sense.unit) {
			builtSense += ` ${sense.unit}`;
		}
		return builtSense;
	}
	public parseLanguages(languages: Creature['languages']): string {
		let languageString = '**Languages** ';
		if (languages?.languages?.length) {
			languageString += languages.languages.join(', ');
		}
		if (languages?.abilities?.length) {
			if (languageString.length) languageString += ' - ';
			languageString += ` ${languages.abilities.join(', ')}`;
		}
		if (languages?.notes?.length) {
			if (languageString.length) languageString += '; ';
			languageString += languages.notes.join(', ');
		}
		return languageString;
	}
	public parseStat(stat: Stat | number): string {
		if (_.isNumber(stat)) return applyOperatorIfNumber(stat);
		let statString = '';
		if (stat.std != null || stat.default != null) {
			const untypedStat = stat.std ?? stat.default;
			if (_.isFinite(Number(untypedStat))) {
				if (Number(untypedStat) < 0) {
					statString += untypedStat;
				} else statString += `+${untypedStat}`;
			} else statString = (untypedStat ?? '').toString();
		}
		const statWithoutKnownProperties = _.omit(stat, [
			'std',
			'default',
			'abilities',
			'notes',
			'note',
		]);
		const propKeys = Object.keys(statWithoutKnownProperties);
		const parsedProps = propKeys
			.map(key => {
				return `${key} ${statWithoutKnownProperties[key]}`;
			})
			.join(', ');
		if (parsedProps.length) {
			statString += ` (${parsedProps})`;
		}
		const allNotes = [...(stat.notes ?? []), ...(stat.note ? [stat.note] : [])].flat();
		if (allNotes.length) {
			statString += `; ${allNotes.join(', ')}`;
		}
		return statString;
	}
	public parseGroupedRecordStat(recordGroup: string, record: TargetValueRecord) {
		let stat: string | undefined = undefined;
		let statNotes: string | number | undefined = undefined;
		// this has to be a local variable for typescript typing magic
		const targetStatEntry = record[recordGroup];
		if (_.isNumber(targetStatEntry) || _.isString(targetStatEntry)) {
			stat = applyOperatorIfNumber(targetStatEntry);
		}
		if (
			record.notes &&
			// It can't be one of these anyway, but we had to do this
			// for zod to be happy
			!_.isNumber(record.notes) &&
			!_.isString(record.notes) &&
			record.notes[recordGroup]
		) {
			statNotes = record.notes?.[recordGroup];
		}
		if (stat == null && statNotes == null) return undefined;
		else {
			return [stat, statNotes].filter(_.isUndefined).join(' ');
		}
	}
	public splitRecordsIntoGroups(label: string, record: TargetValueRecord) {
		const groupedResults: { std: string[]; [k: string]: string[] } = {
			std: [],
		};

		const stdValue = this.parseGroupedRecordStat('std', record);
		const defaultValue = this.parseGroupedRecordStat('std', record);
		if (stdValue || defaultValue) {
			groupedResults.std.push(`**${label}** ${stdValue ?? defaultValue}`);
		}
		const groups = _.keys(_.omit(record, ['std', 'default', 'notes']));
		for (const group of groups) {
			const groupValue = this.parseGroupedRecordStat(group, record);
			if (groupValue) {
				if (!groupedResults[group]) groupedResults[group] = [];
				groupedResults[group].push(`**${label}** ${groupValue}`);
			}
		}
		return groupedResults;
	}
	public parseAttributes(attributes: Creature['abilityMods']): string {
		const attributeContent: string[] = [];
		if (attributes?.str) attributeContent.push(`**Str** ${this.parseStat(attributes.str)}`);
		if (attributes?.dex) attributeContent.push(`**Dex** ${this.parseStat(attributes.dex)}`);
		if (attributes?.con) attributeContent.push(`**Con** ${this.parseStat(attributes.con)}`);
		if (attributes?.int) attributeContent.push(`**Int** ${this.parseStat(attributes.int)}`);
		if (attributes?.wis) attributeContent.push(`**Wis** ${this.parseStat(attributes.wis)}`);
		if (attributes?.cha) attributeContent.push(`**Cha** ${this.parseStat(attributes.cha)}`);
		return attributeContent.join(', ');
	}
	public parseDefenses(defenses: Defenses): string {
		// AC and saves
		const acLine: string[] = [];
		if (defenses.ac) {
			acLine.push(`**AC** ${this.parseStat(defenses.ac)}`);
		}
		if (defenses.savingThrows) {
			let savesString: string[] = [];
			if (defenses.savingThrows.fort) {
				savesString.push(`**Fort** ${this.parseStat(defenses.savingThrows.fort)}`);
			}
			if (defenses.savingThrows.ref) {
				savesString.push(`**Ref** ${this.parseStat(defenses.savingThrows.ref)}`);
			}
			if (defenses.savingThrows.will) {
				savesString.push(`**Will** ${this.parseStat(defenses.savingThrows.will)}`);
			}
			let savesResult = savesString.join(', ');
			if (defenses.savingThrows.abilities?.length) {
				savesResult += ` (${defenses.savingThrows.abilities.join(', ')})`;
			}
			acLine.push(savesResult);
		}

		// HP Resistances / Weaknesses / Immunities
		const defaultHpLine: string[] = [];
		const hpGroups: { [k: string]: string[] } = {};

		const addDefenseToGroups = (
			label: string,
			defense: TargetValueRecord | string | number
		) => {
			if (_.isString(defense) || _.isNumber(defense)) {
				defaultHpLine.push(`**${label}** ${defense}`);
				return;
			}
			const groups = this.splitRecordsIntoGroups(label, defense);
			if (groups.std.length) {
				defaultHpLine.push(groups.std.join(', '));
			}
			for (const group of _.keys(_.omit(groups, ['std']))) {
				if (!hpGroups[group]) hpGroups[group] = [];
				hpGroups[group].push(groups[group].join(', '));
			}
		};

		if (_.isArray(defenses.hp)) {
			const hpGroups: string[] = [];
			for (const hpValue of defenses.hp) {
				let hpLine = hpValue.hp.toString();
				if (hpValue.name) hpLine = ` **${hpValue.name}**s` + hpLine;
				if (hpValue.abilities) {
					hpLine += ` (${hpValue.abilities.join(', ')})`;
				}
				if (hpValue.notes?.length) {
					hpLine += ` (${hpValue.notes.join(', ')})`;
				}
				hpGroups.push(hpLine);
			}
			defaultHpLine.push(`**HP** ${hpGroups.join(', ')}`);
		} else if (defenses.hp) {
			addDefenseToGroups('HP', defenses.hp);
		}
		if (defenses.bt) {
			addDefenseToGroups('BT', defenses.bt);
		}
		if (defenses.hardness) {
			addDefenseToGroups('Hardness', defenses.hardness);
		}
		if (defenses.thresholds?.length) {
			defaultHpLine.push(
				defenses.thresholds
					.map(
						threshold =>
							`**Thresholds** ${threshold.value} (${threshold.squares} squares)`
					)
					.join(',')
			);
		}
		if (defenses.resistances?.length) {
			const resistances: string[] = [];
			for (const resistance of defenses.resistances) {
				if (_.isString(resistance)) {
					resistances.push(resistance);
				} else {
					let resistanceString = resistance.name;
					if (resistance.amount) {
						resistanceString += ` ${resistance.amount}`;
					}
					if (resistance.note) {
						resistanceString += ` (${resistance.note})`;
					}
					resistances.push(resistanceString);
				}
			}
			defaultHpLine.push(`**Resistances** ${resistances.join(', ')}`);
		}
		if (defenses.weaknesses?.length) {
			const weaknesses: string[] = [];
			for (const weakness of defenses.weaknesses) {
				if (_.isString(weakness)) {
					weaknesses.push(weakness);
				} else {
					let weaknessString = weakness.name;
					if (weakness.amount) {
						weaknessString += ` ${weakness.amount}`;
					}
					if (weakness.note) {
						weaknessString += ` (${weakness.note})`;
					}
					weaknesses.push(weaknessString);
				}
			}
			defaultHpLine.push(`**Weaknesses** ${weaknesses.join(', ')}`);
		}
		if (defenses.immunities?.length) {
			defaultHpLine.push(`**Immunities** ${defenses.immunities.join(', ')}`);
		}
		const defaultString = defaultHpLine.join('; ');
		const acString = acLine.join('; ');
		const groupStrings = _.keys(hpGroups).map(group => {
			return `**${group}**: ${hpGroups[group].join('; ')}`;
		});
		return [acString, defaultString, ...groupStrings].filter(_.isEmpty).join('\n');
	}
	public parseSpeed(speed: Speed) {
		const speeds: string[] = [];
		if (speed.walk) speeds.push(`${this.parseTypedNumber(speed.walk)} feet`);
		if (speed.climb) speeds.push(`climb ${this.parseTypedNumber(speed.climb)} feet`);
		if (speed.burrow) speeds.push(`burrow ${this.parseTypedNumber(speed.burrow)} feet`);
		if (speed.fly) speeds.push(`fly ${this.parseTypedNumber(speed.fly)} feet`);
		if (speed.swim) speeds.push(`swim ${this.parseTypedNumber(speed.swim)} feet`);
		if (speed.dimensional)
			speeds.push(`dimensional ${this.parseTypedNumber(speed.dimensional)} feet`);
		let speedString = speeds.join(', ');
		if (speed.speedNote) speedString += ` (${speed.speedNote})`;
		if (speed.abilities) {
			speedString += `; ${speed.abilities.join(', ')}`;
		}
		const otherSpeeds = Object.keys(speed).filter((key: string) =>
			[
				'walk',
				'climb',
				'burrow',
				'fly',
				'swim',
				'dimensional',
				'abilities',
				'speedNote',
			].includes(key)
		);
		for (const speedType of otherSpeeds) {
			speedString += `; ${speedType} ${this.parseTypedNumber(speed[speedType])}`;
		}

		return `**Speed** ${speedString}`;
	}
}
