import type { CompendiumModel } from '../compendium.model.js';
import _ from 'lodash';
import { SharedParsers } from './compendium-parser-helpers.js';
import { AttachmentBuilder } from 'discord.js';
import { _parseCreature } from './lib/creature-parser.js';
import { _parseAbility } from './lib/ability-parser.js';
import { _parseAction } from './lib/action-parser.js';
import { _parseAffliction } from './lib/affliction-parser.js';
import { _parseAncestry } from './lib/ancestry-parser.js';
import { _parseArchetype } from './lib/archetype-parser.js';
import { _parseBackground } from './lib/background-parser.js';
import { _parseBook } from './lib/book-parser.js';
import { _parseClassFeature } from './lib/class-feature-parser.js';
import { _parseClass } from './lib/class-parser.js';
import { _parseCompanionAbility } from './lib/companion-ability-parser.js';
import { _parseCondition } from './lib/condition-parser.js';
import { _parseCreatureTemplate } from './lib/creature-template-parser.js';
import { _parseDeity } from './lib/deity-parser.js';
import { _parseDomain } from './lib/domain-parser.js';
import { _parseEidolon } from './lib/eidolon-parser.js';
import { _parseEvent } from './lib/event-parser.js';
import { _parseFamiliar } from './lib/familiar-parser.js';
import { _parseFeat } from './lib/feat-parser.js';
import { _parseGroup } from './lib/group-parser.js';
import { _parseHazard } from './lib/hazard-parser.js';
import { _parseItem } from './lib/item-parser.js';
import { _parseLanguage } from './lib/language-parser.js';
import { _parseOptionalFeature } from './lib/optional-feature-parser.js';
import { _parsePlace } from './lib/place-parser.js';
import { _parseQuickRule } from './lib/quick-rule-parser.js';
import { _parseRitual } from './lib/ritual-parser.js';
import { _parseSkill } from './lib/skill-parser.js';
import { _parseSource } from './lib/source-parser.js';
import { _parseSpell } from './lib/spell-parser.js';
import { _parseSubclassFeature } from './lib/subclass-feature-parser.js';
import { _parseTrait } from './lib/trait-parser.js';
import { _parseVariantRule } from './lib/variant-rule-parser.js';
import { _parseVehicle } from './lib/vehicle-parser.js';
import { _parseCompanion } from './lib/companion-parser.js';
import { _parseVersatileHeritage } from './lib/versatile-heritage-parser.js';
import { _parseFamiliarAbility } from './lib/familiar-ability-parser.js';
import { _parseOrganization } from './lib/organization-parser.js';
import { _parseTable } from './lib/table-parser.js';
import { _parseRelicGift } from './lib/relic-gift-parser.js';
import { _parseRenderDemo } from './lib/render-demo-parser.js';
import { EntryParser } from './compendium-entry-parser.js';

export class CompendiumEmbedParser {
	public helpers: SharedParsers;
	public files: AttachmentBuilder[];
	public entryParser: EntryParser;
	constructor(
		public model: CompendiumModel,
		public emojiConverter: { (emoji: string): string }
	) {
		this.files = [];
		this.helpers = new SharedParsers();
		this.entryParser = new EntryParser({ delimiter: '\n', emojiConverter, embedParser: this });
	}
	public parseAbility = _parseAbility;
	public parseAction = _parseAction;
	public parseAffliction = _parseAffliction;
	public parseAncestry = _parseAncestry;
	public parseArchetype = _parseArchetype;
	public parseCreature = _parseCreature;
	public parseBackground = _parseBackground;
	public parseBook = _parseBook;
	public parseClassFeature = _parseClassFeature;
	public parseClass = _parseClass;
	public parseCompanionAbility = _parseCompanionAbility;
	public parseCompanion = _parseCompanion;
	public parseCondition = _parseCondition;
	public parseCreatureTemplate = _parseCreatureTemplate;
	public parseDeity = _parseDeity;
	public parseDomain = _parseDomain;
	public parseEidolon = _parseEidolon;
	public parseEvent = _parseEvent;
	public parseFamiliarAbility = _parseFamiliarAbility;
	public parseFamiliar = _parseFamiliar;
	public parseFeat = _parseFeat;
	public parseGroup = _parseGroup;
	public parseHazard = _parseHazard;
	public parseItem = _parseItem;
	public parseLanguage = _parseLanguage;
	public parseOptionalFeature = _parseOptionalFeature;
	public parseOrganization = _parseOrganization;
	public parsePlace = _parsePlace;
	public parseQuickRule = _parseQuickRule;
	public parseRenderDemo = _parseRenderDemo;
	public parseRitual = _parseRitual;
	public parseRelicGift = _parseRelicGift;
	public parseSkill = _parseSkill;
	public parseSource = _parseSource;
	public parseSpell = _parseSpell;
	public parseSubclassFeature = _parseSubclassFeature;
	public parseTable = _parseTable;
	public parseTrait = _parseTrait;
	public parseVariantRule = _parseVariantRule;
	public parseVehicle = _parseVehicle;
	public parseVersatileHeritage = _parseVersatileHeritage;

	public async preprocessData(data: any): Promise<any> {
		let dataAsString = JSON.stringify(data);

		//remove the prompts
		dataAsString = dataAsString.replaceAll(/\#\$[^\#\$]+\$\#/g, (match: string): string => {
			const defaultValue = /default\=([0-9]+)>/g.exec(match);
			if (defaultValue?.[1] != null) return defaultValue[1];
			const min = /min\=([0-9]+)/g.exec(match);
			if (min?.[1] != null) return min[1];
			return '1';
		});

		// Lexer
		const tokenizedText: string[] = [];
		let currentToken = '';
		for (let i = 0; i < dataAsString.length; i++) {
			if (
				// single character tokens
				dataAsString[i] === '{' || // open group
				dataAsString[i] === '}' // close group
			) {
				if (currentToken.length) tokenizedText.push(currentToken);
				tokenizedText.push(dataAsString[i]);
				currentToken = '';
			} else if (
				// open render tag identifier
				dataAsString[i] === '@' &&
				i > 0 &&
				dataAsString[i - 1] === '{'
			) {
				if (currentToken.length) tokenizedText.push(currentToken);
				currentToken = dataAsString[i];
			} else if (
				// close render tag identifier
				currentToken.startsWith('@') &&
				dataAsString[i] === ' '
			) {
				if (currentToken.length) tokenizedText.push(currentToken);
				currentToken = '';
			} else {
				currentToken += dataAsString[i];
			}
		}

		// Parser of the Lexer

		const parseRenderTagGroup = async (renderTagGroup: string[]): Promise<string> => {
			const tagContent = renderTagGroup.slice(2, renderTagGroup.length - 1).join('');
			const lowerTagContent = tagContent.toLowerCase();
			const tagType = renderTagGroup[1].toLowerCase();

			function generateLink(text: string, resourceName: string, defaultSrc: string = 'crb') {
				const [name, src, displaytext] = text.split('|');
				return `[${
					displaytext ?? name
				}](https://pf2etools.com/${resourceName}.html#${name.replaceAll(' ', '%20')}_${
					src || defaultSrc
				})`;
			}

			let newContent = '';
			switch (tagType) {
				case '@as':
				case '@actionsymbol':
					if (['a', '1'].includes(lowerTagContent)) {
						newContent = this.emojiConverter('oneAction');
					} else if (['d', '2'].includes(lowerTagContent)) {
						newContent = this.emojiConverter('twoActions');
					} else if (['t', '3'].includes(lowerTagContent)) {
						newContent = this.emojiConverter('threeActions');
					} else if (['f', '4'].includes(lowerTagContent)) {
						newContent = this.emojiConverter('free');
					} else if (['r', '5'].includes(lowerTagContent)) {
						newContent = this.emojiConverter('reaction');
					}
					break;
				case '@b':
				case '@bold':
					newContent = `**${tagContent}**`;
					break;
				case '@i':
				case '@italic':
				case '@note':
				case '@sub':
					newContent = `*${tagContent}*`;
					break;
				case '@s':
				case '@strike':
					newContent = `~~${tagContent}~~`;
					break;
				case '@u':
				case '@underline':
					newContent = `__${tagContent}__`;
					break;
				case '@divider':
					newContent = '``` ```';
					break;
				case '@n':
				case '@nostyle':
				case '@c':
				case '@center':
					newContent = `__${tagContent}__`;
					break;
				case '@sup':
					newContent = tagContent;
					break;
				case '@homebrew':
				case '@color':
				case '@handwriting':
				case '@highlight':
				case '@indentFirst':
				case '@indentSubsequent':
					newContent = tagContent;
					break;

				case '@flatdc':
					newContent = `Flat DC ${tagContent}`;
					break;
				case '@dc':
					newContent = `DC ${tagContent}`;
					break;
				case '@damage':
					newContent = tagContent;
					break;
				case '@dice':
					const [dice, diceDisplayText] = tagContent.split('|');
					const diceOptions = dice.split(';').join('/');
					newContent = `${diceDisplayText ?? diceOptions}`;
					break;
				case '@d20':
				case '@hit':
					const [hitBonus, hitDisplayText, rolledByName, map] = tagContent.split('|');
					newContent = hitBonus + map ? ` (${map})` : '';
					break;
				case '@chance':
					const [chance, chanceDisplayText] = tagContent.split('|');
					newContent = `${chanceDisplayText ?? `${chance}%`}`;
					break;
				case '@scaledice':
					const [, , scaleDice] = tagContent.split('|')[0];
					const scaleDiceOptions = scaleDice.split(';').join('/');
					newContent = scaleDiceOptions ?? '';
					break;
				case '@scaledamage':
					const [, , scaleDamage] = tagContent.split('|')[0];
					const scaleDamageOptions = scaleDamage.split(';').join('/');
					newContent = scaleDamageOptions ?? '';
					break;

				// not used yet
				case '@adventure':
				// can become links, but is fine as just text
				case '@filter':
				case '@loader':
					newContent = tagContent.split('|')[0];
					break;
				case '@link':
					const [linkText, linkUrl] = tagContent.split('|');
					newContent = `[${linkUrl ? linkText : 'link'}](${(
						linkUrl ?? linkText
					).replaceAll(' ', '%20')})`;
					break;
				case '@pf2etools':
					const [pf2eToolsText, pf2eToolsUrl] = tagContent.split('|');
					newContent = `[${pf2eToolsText}](https://pf2etools.com/${pf2eToolsUrl.replaceAll(
						' ',
						'%20'
					)})`;
					break;
				case '@footnote':
					const [footnoteText, footnoteExtra, footnoteReference] = tagContent.split('|');
					newContent = `${footnoteText} (*${footnoteExtra} --${footnoteReference}*)`;
					break;
				case '@domain':
				case '@skill':
				case '@group':
					newContent = tagContent;
					break;
				case '@book':
				case '@quickref':
					const [bookText, bookSrc, bookChapter, bookHeading] = tagContent.split('|');
					newContent = `*(${bookText} ${bookChapter ?? ''}${
						bookHeading ? `: ${bookHeading}` : ''
					})*`;
					break;
				case '@deity':
					newContent = generateLink(tagContent, 'deities');
					break;
				case '@trait':
					const [traitText, traitSrc, traitDisplayText] = tagContent.split('|');
					newContent = `[${
						traitDisplayText ?? traitText
					}](https://pf2etools.com/traits.html#${traitText.replaceAll(' ', '%20')}${
						traitSrc ? `_${traitSrc}` : ''
					})`;
					break;
				case '@class':
					newContent = generateLink(tagContent, 'classes');
					break;
				case '@subclassfeature':
				case '@classfeature':
					newContent = tagContent.split('|')[0];
					break;
				case '@runeitem':
					const [runeItemText, runeItemSrc, ...runes] = tagContent.split('|');
					const displayTextList = [];
					for (let i = 0; i < runes.length; i += 2) {
						if (!runes[i + 1]) break;
						displayTextList.push(runes[i]);
					}
					newContent = `[${displayTextList.join(' ') + runeItemText}`;
				case '@condition':
					newContent = generateLink(tagContent, 'conditions');
					break;
				case '@spell':
					newContent = generateLink(tagContent, 'spells');
					break;
				case '@ritual':
					newContent = generateLink(tagContent, 'spells');
					break;
				case '@vehicle':
					newContent = generateLink(tagContent, 'vehicles', 'gmg');
					break;
				case '@relicgift':
					newContent = generateLink(tagContent, 'relicGifts', 'gmg');
					break;
				case '@item':
					newContent = generateLink(tagContent, 'items');
					break;
				case '@creature':
					newContent = generateLink(tagContent, 'creatures', 'b1');
					break;
				case '@disease':
					newContent = generateLink(tagContent, 'diseases', 'gmg');
					break;
				case '@affliction':
					newContent = generateLink(tagContent, 'afflictions', 'gmg');
					break;
				case '@curse':
					newContent = generateLink(tagContent, 'curses', 'gmg');
					break;
				case '@bg':
				case '@background':
					newContent = generateLink(tagContent, 'backgrounds');
					break;
				case '@archetype':
					newContent = generateLink(tagContent, 'archetypes');
					break;
				case '@versatileheritage':
					newContent = generateLink(tagContent, 'versatileHeritages', 'apg');
					break;
				case '@ancestry':
					newContent = generateLink(tagContent, 'ancestries');
					break;
				case '@eidolon':
					newContent = generateLink(tagContent, 'eidolons', 'SoM');
					break;
				case '@familiar':
					newContent = generateLink(tagContent, 'companionsFamiliars', 'apg');
					break;
				case '@companion':
				case '@familiarability':
				case '@companionability':
					newContent = generateLink(tagContent, 'companionsFamiliars');
					break;
				case '@feat':
					newContent = generateLink(tagContent, 'feats');
					break;
				case '@organization':
					newContent = generateLink(tagContent, 'organizations', 'locg');
					break;
				case '@creaturetemplate':
					newContent = generateLink(tagContent, 'creatureTemplates', 'b1');
					break;
				case '@hazard':
					newContent = generateLink(tagContent, 'hazards');
					break;
				case '@optfeature':
					newContent = generateLink(tagContent, 'optionalFeatures', 'apg');
					break;
				case '@variantrule':
					newContent = generateLink(tagContent, 'variantRules', 'gmg');
					break;
				case '@table':
					newContent = generateLink(tagContent, 'tables');
					break;
				case '@action':
					newContent = generateLink(tagContent, 'actions');
					break;
				case '@ability':
					newContent = generateLink(tagContent, 'abilities', 'b1');
					break;
				case '@language':
					newContent = generateLink(tagContent, 'languages');
					break;
				case '@event':
					newContent = generateLink(tagContent, 'events', 'lotg');
					break;
				case '@place':
				case '@plane':
				case '@nation':
				case '@settlement':
					newContent = generateLink(tagContent, 'places', 'gmg');
					break;
			}
			return newContent;
		};

		// Traverse the tokens and parse tag groups
		const layers: string[][] = [[]];
		let currentLayer = 0;
		for (let i = 0; i < tokenizedText.length; i++) {
			if (tokenizedText[i] === '}') {
				// close the current layer
				layers[currentLayer].push(tokenizedText[i]);
				if (layers[currentLayer][1].startsWith('@')) {
					// this is a render tag, parse it
					const processed = await parseRenderTagGroup(layers[currentLayer]);
					layers[currentLayer - 1].push(processed);
				} else {
					// this is a regular group, join it back together
					layers[currentLayer - 1].push(layers[currentLayer].join(''));
				}
				// remove the current layer
				delete layers[currentLayer];
				// move back a layer
				currentLayer--;
			} else if (tokenizedText[i] === '{') {
				// open a new layer
				currentLayer++;
				layers[currentLayer] = [tokenizedText[i]];
			} else {
				// add the token to the current layer
				layers[currentLayer].push(tokenizedText[i]);
			}
		}
		return JSON.parse(layers[0].join(''));
	}
}
