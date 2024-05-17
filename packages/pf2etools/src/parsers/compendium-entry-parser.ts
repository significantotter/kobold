import _ from 'lodash';
import type {
	AbilityEntry,
	Action,
	Activate,
	Activity,
	AfflictionEntry,
	AttackEntry,
	Background,
	DataEntry,
	DataGenericContent,
	Entry,
	Feat,
	Hazard,
	Heightening,
	ImageEntry,
	LevelEffectEntry,
	Pf2EKeyAbility,
	Pf2eOptions,
	QuoteEntry,
	RefEntry,
	Ritual,
	SemanticEntry,
	SuccessDegreeEntry,
	TableEntry,
	TableGroupEntry,
} from '../schemas/index-types.js';
import { SharedParsers, applyOperatorIfNumber, nth } from './compendium-parser-helpers.js';
import { table } from 'table';
import type { CompendiumEmbedParser } from './compendium-parser.js';
import type { EmbedData } from 'discord.js';
import { parseHazard } from './lib/hazard-parser.js';
import { parseRitual } from './lib/ritual-parser.js';
import { parseBackground } from './lib/background-parser.js';
import { parseAction } from './lib/action-parser.js';

const discordLinkRegex =
	/\[[\w _\-\)\(]+\]\(((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[ \.\!\/\\\w]*))?)\)/g;

const emojiSpecialCharacterOptions = [
	'☈',
	'☊',
	'☧',
	'☡',
	'☠',
	'☙',
	'☃',
	'♇',
	'♄',
	'♅',
	'♆',
	'☬',
	'☫',
	'⚕',
	'⚗',
	'⚝',
	'⚞',
	'⚟',
	'⚳',
	'⚴',
	'⚵',
	'⚶',
	'⚷',
	'⚸',
	'⚹',
	'⚺',
	'⚻',
	'⚼',
	'⚊',
	'⚋',
	'⚌',
	'⚍',
	'⚎',
	'⚏',
	'☰',
	'☱',
	'☲',
	'☳',
	'☴',
	'☵',
	'☶',
	'☷',
	'☟',
	'☞',
	'☝',
	'☜',
];

const fakeEmojiConverter = (emoji: string) =>
	({
		reaction: 'react',
		freeAction: 'free',
		oneAction: '1a',
		twoActions: '2a',
		threeActions: '3a',
	}[emoji] ?? emoji);

export class EntryParser {
	helpers: SharedParsers;
	delimiter: string;
	embedParser?: CompendiumEmbedParser;
	emojiConverter: { (emoji: string): string };
	constructor(options: {
		delimiter?: string;
		emojiConverter?: { (emoji: string): string };
		embedParser?: CompendiumEmbedParser;
	}) {
		this.emojiConverter = options.emojiConverter ?? fakeEmojiConverter;
		this.delimiter = options.delimiter ?? ', ';
		this.helpers = new SharedParsers();
		this.embedParser = options.embedParser;
	}

	public parseASEmojiFromEntry(entry: string) {
		if (entry.includes('{@as ')) {
			const splitEmoji = entry.split('{@as ');
			let finalString = '';
			for (const split of splitEmoji) {
				if (split.includes('}')) {
					const [emoji, rest] = split.split('}');
					let emojiText = '';
					if (emoji == 'r') emojiText = this.emojiConverter('reaction');
					else if (emoji == 'f') emojiText = this.emojiConverter('freeAction');
					else if (emoji == '1') emojiText = this.emojiConverter('oneAction');
					else if (emoji == '2') emojiText = this.emojiConverter('twoActions');
					else if (emoji == '3') emojiText = this.emojiConverter('threeActions');
					else emojiText = emoji;
					finalString += emojiText + rest;
				} else {
					finalString += split;
				}
			}
			return finalString;
		}
		return entry;
	}

	public parseActivityEmoji(activity: Activity) {
		if (activity.customUnit) return `${activity.number} ${activity.customUnit}`;
		const unit = activity.unit ?? 'action';
		if (unit === 'reaction') {
			return this.emojiConverter('reaction');
		} else if (unit === 'free') {
			return this.emojiConverter('freeAction');
		} else if (['action', 'actions'].includes(unit)) {
			if (activity.number === 1) {
				return this.emojiConverter('oneAction');
			} else if (activity.number === 2) {
				return this.emojiConverter('twoActions');
			} else if (activity.number === 3) {
				return this.emojiConverter('threeActions');
			}
		}
		if (activity.entry && _.isString(activity.entry) && activity.entry.includes('{@as ')) {
			return this.parseASEmojiFromEntry(activity.entry);
		}
		return '';
	}

	public parseActivity(activity: Activity, convertEmoji: boolean = true) {
		if (!activity) return '';
		if (activity.entry) {
			if (_.isString(activity.entry)) {
				return this.parseASEmojiFromEntry(activity.entry);
			}
			return `${activity.unit} ${this.parseEntry(activity.entry)}`;
		}
		if (activity.customUnit) return `${activity.number} ${activity.customUnit}`;
		const unit = activity.unit ?? 'action';
		const emojiConverter = convertEmoji ? this.emojiConverter : (emoji: string) => emoji;
		if (unit === 'reaction') {
			return emojiConverter('reaction');
		} else if (unit === 'free') {
			return emojiConverter('freeAction');
		} else if (['action', 'actions'].includes(unit)) {
			if (activity.number === 1) {
				return emojiConverter('oneAction');
			} else if (activity.number === 2) {
				return emojiConverter('twoActions');
			} else if (activity.number === 3) {
				return emojiConverter('threeActions');
			}
		}
		return `${activity.number ?? ''} ${unit}`.trim();
	}
	public parseActivate(activate: Activate) {
		const activateLine: string[] = ['**Activate**'];
		if (activate?.activity) activateLine.push(this.parseActivity(activate.activity));
		if (activate?.traits?.length) activateLine.push(`(${activate.traits.join(', ')})`);
		if (activate?.note) activateLine.push(activate.note);
		if (activate?.components?.length)
			activateLine.push(`**Components** ${activate.components.join(', ')}`);
		if (activate?.trigger) activateLine.push(`**Trigger** ${activate.trigger}`);
		if (activate?.requirements) activateLine.push(`**Requirements** ${activate.requirements}`);
		return activateLine.join(' ');
	}

	public parseEntry(entry: Entry, showTitle: boolean = true): string {
		if (!entry) return '';
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
		else
			try {
				return this.parseAbilityEntry(entry as AbilityEntry, showTitle);
			} catch (e) {
				return this.parseSemanticEntry(entry as SemanticEntry, showTitle);
			}
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

	public parseFormattedTableRows(parsedTable: string[][]): string {
		const allowedColWidths = [52, 23, 18, 15];
		const maxColWidth = allowedColWidths[parsedTable[0].length - 1];
		const colOptions = [];
		const discordEmojiRegex = /\<\w*\:\w*\:\w*\>/g;
		const tokenToTrueValueMap: { [k: string]: string } = {};
		const stripDiscordLinks = (str: string): string => {
			// Discord links won't display properly in the table, so we'll strip them out
			// We could remove the formatting for them like emoji, but they're
			// Much more difficult because of the need to line wrap link text
			const linkText = /^\[([\w _\-\)\(]+)\]/g.exec(str.trim())?.[1];
			return linkText ?? str;
		};
		const tokenizeDiscordEmoji = (emoji: string): string => {
			const lowerEmoji = emoji.toLowerCase();
			if (tokenToTrueValueMap[lowerEmoji]) return tokenToTrueValueMap[lowerEmoji];
			else {
				tokenToTrueValueMap[lowerEmoji] =
					' ' +
					emojiSpecialCharacterOptions[Object.keys(tokenToTrueValueMap).length] +
					' ';
			}
			return tokenToTrueValueMap[lowerEmoji];
		};
		const restoreDiscordEmoji = (str: string): string => {
			let result = str;
			for (const [key, value] of Object.entries(tokenToTrueValueMap)) {
				result = result.replaceAll(value, key);
			}
			return result;
		};
		const parsedWithoutDiscordEmoji = parsedTable.map(row =>
			row.map(cell =>
				cell
					.replaceAll(discordEmojiRegex, tokenizeDiscordEmoji)
					.replaceAll(discordLinkRegex, stripDiscordLinks)
			)
		);
		for (const col in parsedWithoutDiscordEmoji[0]) {
			const colLengths = [
				...parsedWithoutDiscordEmoji.map((row, rowIndex) =>
					rowIndex === 0 ? 0 : row[col].length
				),
			];
			const averageCellLength = Math.ceil(
				colLengths.reduce((a, b) => a + b, 0) / parsedWithoutDiscordEmoji.length
			);
			const maxCellLength = Math.max(...colLengths);
			const suggestedCellSize = Math.ceil(
				(averageCellLength + averageCellLength + maxCellLength) / 3
			);
			const headerLimit = Math.ceil(parsedWithoutDiscordEmoji[0][col].length / 3);
			colOptions.push({
				width: Math.min(Math.max(suggestedCellSize, headerLimit), maxColWidth),
			});
		}
		const result = table(parsedWithoutDiscordEmoji, {
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
			columns: colOptions,
		});
		return '`' + restoreDiscordEmoji(result) + '`';
	}

	public parseTableEntry(tableEntry: TableEntry, showTitle: boolean = true): string {
		// remove multirows to make our life easier
		const parsedTable: string[][] = [];
		for (const row of tableEntry.rows) {
			if ('rows' in row) {
				for (const subRow of row.rows) {
					parsedTable.push(subRow.map(_.toString));
				}
			} else {
				parsedTable.push(row.map(_.toString));
			}
		}
		// one or two tables have shorter rows rather than empty cells
		for (const row of parsedTable) {
			while (row.length < parsedTable[0].length) {
				row.push('');
			}
		}
		// we can't handle more than 5 columns. We'll split the table into leftmost + 4 columns and recurse
		const columnCount = parsedTable[0].length;
		const maxAllowedColumns = 4;
		if (columnCount > maxAllowedColumns) {
			// determine the number of splits to make
			const splitCount = Math.ceil((columnCount - 1) / (maxAllowedColumns - 1));
			// figure out how many columns each split should have
			const colsPerSplit = Math.ceil((columnCount - 1) / splitCount);
			// split the table into that many columns
			const splitTables: string[][][] = [];
			for (let z = 0; z < splitCount; z++) {
				splitTables[z] = [];
				for (let i = 0; i < parsedTable.length; i++) {
					const currentRow = parsedTable[i];
					// the first column is always the same as the original table
					splitTables[z][i] = [currentRow[0]];
					for (let j = 1; j <= colsPerSplit; j++) {
						// z is the number of groups we've completed
						// so multiply by the total group count, then iterate
						// over the current colsPerSplit count in j
						splitTables[z][i].push(currentRow[z * colsPerSplit + j]);
					}
					// we aren't assured that the last row will have the same number of columns
					// so as a cheap fix, filter out undefined values
					splitTables[z][i] = splitTables[z][i].filter(_.identity);
				}
			}
			// recurse on each split
			return splitTables
				.map(splitTable => this.parseFormattedTableRows(splitTable))
				.join('\n\n');
		} else {
			return this.parseFormattedTableRows(parsedTable);
		}
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

	public embedDataToString(embedData: EmbedData) {
		if (!embedData) return '';
		const embedLines: string[] = [];
		if (embedData.title) embedLines.push(embedData.title);
		if (embedData.description) embedLines.push(embedData.description);
		if (embedData.fields?.length) {
			for (const field of embedData.fields) {
				embedLines.push(`${field.name} ${field.value}`.trim());
			}
		}
		return embedLines.join(this.delimiter);
	}

	public parseGenericDataEntry(entry: DataGenericContent): string {
		if (!entry) return '';
		const genericLines: string[] = [];
		let title = entry?.name ?? '';
		if (entry.activity) {
			title += ` ${this.parseActivity(entry.activity)}`;
		}
		if (entry.level) {
			title += ` (Level ${entry.level})`;
		}
		genericLines.push(`**${title}**`);
		if (entry.traits?.length) {
			genericLines.push(` (${entry.traits.join(', ')})`);
		}
		if (entry.type) {
			genericLines.push(`**${entry.type}**`);
		}
		if (entry.category) {
			genericLines.push(`**Category** ${entry.category}`);
		}
		if (entry.frequency) {
			genericLines.push(this.helpers.parseFrequency(entry.frequency));
		}
		if (entry.sections) {
			genericLines.push(
				entry.sections
					.filter(_.identity)
					.map(sectionGroup =>
						sectionGroup.map(section => this.parseEntries(section)).join(this.delimiter)
					)
					.join(this.delimiter)
			);
		}
		return genericLines.join(this.delimiter);
	}

	public parseDataEntry(entry: DataEntry, showTitle: boolean = true): string {
		if (!entry) return '';
		if (this.embedParser) {
			if (entry.tag === 'background')
				return this.embedDataToString(
					parseBackground.call(this.embedParser, entry.data as Background) ??
						(entry as unknown as Background)
				);
			if (entry.tag === 'hazard')
				return this.embedDataToString(
					parseHazard.call(this.embedParser, entry.data as Hazard) ??
						(entry as unknown as Hazard)
				);
			if (entry.tag === 'ritual')
				return this.embedDataToString(
					parseRitual.call(this.embedParser, entry.data as Ritual) ??
						(entry as unknown as Ritual)
				);
			if (entry.tag === 'action')
				return this.embedDataToString(
					parseAction.call(
						this.embedParser,
						(entry.data as Action) ?? (entry as unknown as Action)
					)
				);
			if (entry.tag === 'curse') return `(See Curse "${entry.name}")`;
			if (entry.tag === 'item') return `(See Item "${entry.name}")`;
			if (entry.tag === 'spell') return `(See Spell "${entry.name}")`;
			if (entry.tag === 'place') return `(See Place "${entry.name}")`;
			if (entry.tag === 'disease') return `(See Disease "${entry.name}")`;
			if (entry.tag === 'eidolon') return `(See Eidolon "${entry.name}")`;
			if (entry.tag === 'creature') return `(See Creature "${entry.name}")`;
		}
		if (entry.tag === 'generic')
			return this.parseGenericDataEntry(entry.data as DataGenericContent);
		if (entry.tag === 'table') return `See ${entry.name}`;
		if (entry.tag === 'feat') this.parseFeat(entry.data as Feat, true).value;
		if (entry.tag === 'ability')
			return this.parseAbilityEntry(entry.data as AbilityEntry, showTitle);
		if (entry.tag === 'affliction')
			return this.parseAfflictionEntry(entry.data as AfflictionEntry, showTitle);
		return this.parseGenericDataEntry(entry.data as DataGenericContent);
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
		if (entry.entry) semanticLines.push(this.parseEntry(entry.entry));
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
		if (ability.activity) abilityTitle += this.parseActivity(ability.activity);
		return abilityTitle;
	}

	public parseAbilityEntry(ability: AbilityEntry, showTitle: boolean = true): string {
		const abilityLines: string[] = [];
		let abilityTitle = '';

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
		if (!ability.entries?.length && ability.generic?.tag)
			abilityLines.push(`See ${ability.generic.tag} "${ability.name}"`);

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
		attackLine.push(' ' + this.parseActivity(attack.activity ?? { number: 1, unit: 'action' }));
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

	public parseFeat(feat: Feat, showTitle: boolean = true): { name: string; value: string } {
		const activity = feat.activity ? ' ' + this.parseActivity(feat.activity) : '';
		const name = `**${feat.name}**${activity} (Feat ${feat.level})`;

		const descriptionLines: string[] = [];
		if (showTitle) descriptionLines.push(name);
		if (feat.traits) descriptionLines.push(`**Traits** ${feat.traits.join(', ')}`);
		if (feat.frequency) descriptionLines.push(this.helpers.parseFrequency(feat.frequency));
		if (feat.access) descriptionLines.push(`**Access** ${feat.access}`);
		if (feat.cost) descriptionLines.push(`**Cost** ${feat.cost}`);
		if (feat.prerequisites) descriptionLines.push(`**Prerequisites** ${feat.prerequisites}`);

		if (feat.entries) descriptionLines.push(this.parseEntries(feat.entries));

		if (feat.amp?.entries) {
			descriptionLines.push(`**Amp** ${this.parseEntries(feat.amp.entries)}`);
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

	public parseHeightening(heightening: Heightening) {
		const lines = [];
		if (heightening.X) {
			lines.push(
				Object.entries(heightening.X)
					.map(
						([level, effects]) =>
							`**Heightened ${nth(Number(level))}** ${this.parseEntries(effects)}`
					)
					.join('\n')
			);
		}
		if (heightening.plusX) {
			lines.push(
				Object.entries(heightening.plusX)
					.map(
						([level, effects]) =>
							`**Heightened +${level}** ${this.parseEntries(effects)}`
					)
					.join('\n')
			);
		}
		return lines.join(this.delimiter);
	}

	public withDelimiter(delimiter: string): EntryParser {
		return new EntryParser({
			emojiConverter: this.emojiConverter,
			embedParser: this.embedParser,
			delimiter,
		});
	}
}
