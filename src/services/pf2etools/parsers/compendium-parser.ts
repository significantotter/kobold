import { CompendiumModel } from '../compendium.model.js';
import _ from 'lodash';
import { SharedParsers } from './compendium-parser-helpers.js';
import { AttachmentBuilder } from 'discord.js';
import { parseCreature } from './lib/creature-parser.js';
import { parseAbility } from './lib/ability-parser.js';
import { parseAction } from './lib/action-parser.js';
import { parseAffliction } from './lib/affliction-parser.js';
import { parseAncestry } from './lib/ancestry-parser.js';
import { parseArchetype } from './lib/archetype-parser.js';
import { parseBackground } from './lib/background-parser.js';
import { parseBook } from './lib/book-parser.js';
import { parseClassFeature } from './lib/class-feature-parser.js';
import { parseClass } from './lib/class-parser.js';
import { parseCompanionAbility } from './lib/companion-ability-parser.js';
import { parseCondition } from './lib/condition-parser.js';
import { parseCreatureTemplate } from './lib/creature-template-parser.js';
import { parseDeity } from './lib/deity-parser.js';
import { parseDomain } from './lib/domain-parser.js';
import { parseEidolon } from './lib/eidolon-parser.js';
import { parseEvent } from './lib/event-parser.js';
import { parseFamiliar } from './lib/familiar-parser.js';
import { parseFeat } from './lib/feat-parser.js';
import { parseGroup } from './lib/group-parser.js';
import { parseHazard } from './lib/hazard-parser.js';
import { parseItem } from './lib/item-parser.js';
import { parseLanguage } from './lib/language-parser.js';
import { parseOptionalFeature } from './lib/optional-feature-parser.js';
import { parsePlace } from './lib/place-parser.js';
import { parseQuickRule } from './lib/quick-rule-parser.js';
import { parseRitual } from './lib/ritual-parser.js';
import { parseSkill } from './lib/skill-parser.js';
import { parseSource } from './lib/source-parser.js';
import { parseSpell } from './lib/spell-parser.js';
import { parseSubclassFeature } from './lib/subclass-feature-parser.js';
import { parseTrait } from './lib/trait-parser.js';
import { parseVariantRule } from './lib/variant-rule-parser.js';
import { parseVehicle } from './lib/vehicle-parser.js';
import { parseCompanion } from './lib/companion-parser.js';
import { parseVersatileHeritage } from './lib/versatile-heritage-parser.js';
import { parseFamiliarAbility } from './lib/familiar-ability-parser.js';
import { parseOrganization } from './lib/organization-parser.js';
import { parseTable } from './lib/table-parser.js';
import { parseRelicGift } from './lib/relic-gift-parser.js';

export class CompendiumEmbedParser {
	public helpers: SharedParsers;
	public files: AttachmentBuilder[];
	constructor(
		public model: CompendiumModel,
		public emojiConverter: { (emoji: string): string }
	) {
		this.files = [];
		this.helpers = new SharedParsers();
	}
	public parseAbility = parseAbility;
	public parseAction = parseAction;
	public parseAffliction = parseAffliction;
	public parseAncestry = parseAncestry;
	public parseArchetype = parseArchetype;
	public parseCreature = parseCreature;
	public parseBackground = parseBackground;
	public parseBook = parseBook;
	public parseClassFeature = parseClassFeature;
	public parseClass = parseClass;
	public parseCompanionAbility = parseCompanionAbility;
	public parseCompanion = parseCompanion;
	public parseCondition = parseCondition;
	public parseCreatureTemplate = parseCreatureTemplate;
	public parseDeity = parseDeity;
	public parseDomain = parseDomain;
	public parseEidolon = parseEidolon;
	public parseEvent = parseEvent;
	public parseFamiliarAbility = parseFamiliarAbility;
	public parseFamiliar = parseFamiliar;
	public parseFeat = parseFeat;
	public parseGroup = parseGroup;
	public parseHazard = parseHazard;
	public parseItem = parseItem;
	public parseLanguage = parseLanguage;
	public parseOptionalFeature = parseOptionalFeature;
	public parseOrganization = parseOrganization;
	public parsePlace = parsePlace;
	public parseQuickRule = parseQuickRule;
	public parseRitual = parseRitual;
	public parseRelicGift = parseRelicGift;
	public parseSkill = parseSkill;
	public parseSource = parseSource;
	public parseSpell = parseSpell;
	public parseSubclassFeature = parseSubclassFeature;
	public parseTable = parseTable;
	public parseTrait = parseTrait;
	public parseVariantRule = parseVariantRule;
	public parseVehicle = parseVehicle;
	public parseVersatileHeritage = parseVersatileHeritage;

	public preprocessData(data: any): any {}
}
