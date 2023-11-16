import { BaseMessageOptions } from 'discord.js';
import _ from 'lodash';
import type {
	Action,
	Attribute,
	Modifier,
	RollMacro,
	Sheet,
	SheetRecord,
} from '../services/kobold/index.js';
import {
	AbilityEnum,
	Counter,
	ProficiencyStat,
	SheetAttack,
	SheetBaseCounterKeys,
	SheetStatKeys,
} from '../services/kobold/index.js';
import { PathBuilder } from '../services/pathbuilder/pathbuilder.js';
import { WG } from '../services/wanderers-guide/wanderers-guide.js';
import { KoboldError } from './KoboldError.js';
import { AttributeUtils } from './attribute-utils.js';
import { KoboldEmbed } from './kobold-embed-utils.js';
import { ModifierUtils } from './kobold-service-utils/modifier-utils.js';
import {
	convertPathBuilderToSheet,
	convertWanderersGuideCharToSheet,
} from './sheet/sheet-import-utils.js';
import {
	SheetIntegerGroupEnum,
	SheetIntegerProperties,
	SheetProperties,
	SheetStatProperties,
	StatGroupEnum,
} from './sheet/sheet-properties.js';
import { SheetUtils } from './sheet/sheet-utils.js';

const damageTypeShorthands: { [shorthand: string]: string } = {
	piercing: 'p',
	slashing: 's',
	bludgeoning: 'b',
};

export type SettableSheetOption =
	| 'tempHp'
	| 'hp'
	| 'stamina'
	| 'resolve'
	| 'heroPoints'
	| 'focusPoints';

export type rollable = roll | attackRoll;

export interface roll {
	name: string;
	type: string;
	bonus: string | number;
	tags: string[];
}

export interface attackRoll extends SheetAttack {
	type: 'attack';
	tags: string[];
}

export class Creature {
	protected _adjustedSheet: Sheet;
	public actions: Action[];
	public rollMacros: RollMacro[];
	public modifiers: Modifier[];
	constructor(
		public _sheet: Sheet,
		{
			actions,
			rollMacros,
			modifiers,
		}: {
			actions: Action[];
			rollMacros: RollMacro[];
			modifiers: Modifier[];
		},
		protected _name?: string
	) {
		const sheetDefaults: Sheet = SheetProperties.defaultSheet;
		this.actions = actions;
		this.rollMacros = rollMacros;
		this.modifiers = modifiers;
		this._sheet = _.defaultsDeep(this._sheet, sheetDefaults);
		this._adjustedSheet = SheetUtils.adjustSheetWithModifiers(this._sheet, this.modifiers);
	}

	public get sheet(): Sheet {
		return this._adjustedSheet;
	}

	// convenience helpers
	public get name(): string {
		return this._name ?? this.sheet.staticInfo.name;
	}
	public get level(): number {
		return this.sheet.staticInfo.level ?? 0;
	}

	public interpretDc(stat: ProficiencyStat): number {
		if (stat == null) return 0;
		if (stat.dc != null) return stat.dc;
		else if (stat.bonus != null) return 10 + stat.bonus;
		else if (stat.ability != null && stat.proficiency != null) {
			return 10 + stat.proficiency + this.abilities[stat.ability];
		} else return 10;
	}
	public interpretBonus(stat: ProficiencyStat): number {
		if (stat == null) return 0;
		if (stat.bonus != null) return stat.bonus;
		else if (stat.dc != null) return stat.dc - 10;
		else if (stat.ability != null && stat.proficiency != null) {
			return 10 + stat.proficiency + this.abilities[stat.ability];
		} else return 0;
	}

	public profToLevel(prof: number): number {
		if (prof > 0) return prof + (this.sheet.staticInfo.level ?? 0);
		else return 0;
	}

	public statIsUnset(stat: ProficiencyStat): boolean {
		return (
			stat.bonus === null ||
			stat.dc === null ||
			(stat.proficiency === null && stat.ability === null)
		);
	}

	public generateStatBonusDcText(stat: ProficiencyStat): string {
		if (this.statIsUnset(stat)) return '';

		const bonus = this.interpretBonus(stat);

		return `${stat.name}: \`${bonus > 0 ? '+' : ''}${bonus}\`, (DC \`${this.interpretDc(
			stat
		)}\`)`;
	}

	public generateStatBonusText(stat: ProficiencyStat): string {
		if (this.statIsUnset(stat)) return '';

		const bonus = this.interpretBonus(stat);

		return `${stat.name}: \`${bonus > 0 ? '+' : ''}${bonus}\``;
	}

	public sheetBasicStatsText(): string {
		let basicInfo = '';
		if (this.sheet.baseCounters.hp.max) {
			basicInfo += `HP: \`${this.sheet.baseCounters.hp.current ?? 0}\`/\`${
				this.sheet.baseCounters.hp.max
			}\``;

			if (this.sheet.baseCounters.tempHp.current) {
				basicInfo += `, temp: \`${this.sheet.baseCounters.tempHp.current}\`\n`;
			} else basicInfo += '\n';
		}
		if (this.sheet.staticInfo.usesStamina) {
			basicInfo += `${this.sheet.baseCounters.stamina.name}: \`${this.sheet.baseCounters.stamina.current}\`/\`${this.sheet.baseCounters.stamina.max}\` `;
			basicInfo += `${this.sheet.baseCounters.resolve.name}: \`${this.sheet.baseCounters.resolve.current}\`/\`${this.sheet.baseCounters.resolve.max}\`\n`;
		}
		if (this.sheet.baseCounters.heroPoints.max) {
			basicInfo += `${this.sheet.baseCounters.heroPoints.name}: \`${this.sheet.baseCounters.heroPoints.current}\`/\`3\`, `;
		}
		if (this.sheet.baseCounters.focusPoints.max) {
			basicInfo += `${this.sheet.baseCounters.focusPoints.name}: \`${this.sheet.baseCounters.focusPoints.current}\``;
			basicInfo += `/\`${this.sheet.baseCounters.focusPoints.max}\``;
		}
		return basicInfo;
	}

	public sheetDefensiveStatText(): string {
		let basicStatsLines = [];
		if (this.sheet.weaknessesResistances.resistances.length)
			basicStatsLines.push(
				`Resistances: ${this.sheet.weaknessesResistances.resistances
					.map(r => `${r.type} ${r.amount}`)
					.join(', ')}`
			);
		if (this.sheet.weaknessesResistances.weaknesses.length)
			basicStatsLines.push(
				`Weaknesses: ${this.sheet.weaknessesResistances.weaknesses
					.map(w => `${w.type} ${w.amount}`)
					.join(', ')}`
			);
		if (this.sheet.infoLists.immunities?.length)
			basicStatsLines.push(`Immunities: ${this.sheet.infoLists.immunities.join(', ')}`);
		const DCs = [];
		if (this.sheet.intProperties.ac != null) DCs.push(`AC \`${this.sheet.intProperties.ac}\``);
		if (this.sheet.stats.class.dc != null)
			DCs.push(this.generateStatBonusDcText(this.sheet.stats.class));
		if (this.sheet.stats.perception.bonus != null || this.sheet.stats.perception.dc != null)
			DCs.push(this.generateStatBonusDcText(this.sheet.stats.perception));

		if (DCs.length) basicStatsLines.push(`${DCs.join(', ')}`);
		return basicStatsLines.join('\n');
	}

	public sheetGameplayInfoText(): string {
		const gameplayInfoLines = [];
		const hasASpeed =
			this.sheet.intProperties.walkSpeed != null ||
			this.sheet.intProperties.flySpeed != null ||
			this.sheet.intProperties.climbSpeed != null ||
			this.sheet.intProperties.swimSpeed != null;
		if (hasASpeed) {
			let speedLine = `Speed:`;
			if (this.sheet.intProperties.walkSpeed != null)
				speedLine += ` Walk \`${this.sheet.intProperties.walkSpeed}\`ft`;
			if (this.sheet.intProperties.flySpeed != null)
				speedLine += ` Fly \`${this.sheet.intProperties.flySpeed}\`ft`;
			if (this.sheet.intProperties.climbSpeed != null)
				speedLine += ` Climb \`${this.sheet.intProperties.climbSpeed}\`ft`;
			if (this.sheet.intProperties.swimSpeed)
				speedLine += ` Swim \`${this.sheet.intProperties.swimSpeed}\`ft`;
			gameplayInfoLines.push(speedLine);
		}
		if (this.sheet.infoLists.traits.length)
			gameplayInfoLines.push(`Traits: ${this.sheet.infoLists.traits.join(', ')}`);
		if (this.sheet.info.background)
			gameplayInfoLines.push(`Background: ${this.sheet.info.background}`);
		return gameplayInfoLines.join('\n');
	}

	public sheetAbilitiesText(includeTitle: boolean = true): string {
		const title = includeTitle ? 'Abilities: ' : '';
		const abilityText = Object.entries(this.abilities)
			.map(
				([abilityName, abilityValue]) =>
					`${
						SheetProperties.shorthandFromAbility[abilityName as AbilityEnum]
					} \`${abilityValue}\``
			)
			.join(', ');
		return abilityText.length ? `${title}${abilityText}` : '';
	}
	public sheetSaveText(includeTitle: boolean = true): string {
		const title = includeTitle ? 'Saves: ' : '';
		let saveTexts = [];
		for (const save of this.saves) {
			const saveText = this.generateStatBonusDcText(save);
			if (saveText) saveTexts.push(saveText);
		}
		return saveTexts.length ? `Saves: ${saveTexts.join(', ')}` : '';
	}
	public sheetSkillText(includeTitle: boolean = true): string {
		const title = includeTitle ? 'Skills: ' : '';
		const skillTextLines = [];
		for (const skill of this.skills.sort((a, b) =>
			a.name.toString().localeCompare(b.name.toString())
		)) {
			//avoid null values
			skillTextLines.push(this.generateStatBonusText(skill));
		}
		return skillTextLines.length ? `${title}${skillTextLines.join('\n')}` : '';
	}
	public sheetCastingStatText(includeTitle: boolean = true): string {
		let castingStats = [];
		const title = includeTitle ? 'Spellcasting: ' : '';
		for (const castingStat of this.castingStats) {
			const castingStatText = this.generateStatBonusDcText(castingStat);
			if (castingStatText) castingStats.push(castingStatText);
		}
		return castingStats.length ? `${title}${castingStats.join(', ')}` : '';
	}

	public sheetAttacksText(includeTitle: boolean = false): string {
		const attackLines = [];
		for (const attack of this.sheet.attacks) {
			let builtAttack = `**${_.capitalize(attack.name)}**`;
			if (attack.toHit != null) builtAttack += ` \`+${attack.toHit}\``;
			if (attack.traits?.length) builtAttack += ` (${attack.traits.join(', ')})`;
			builtAttack += `,`;
			if (attack.damage?.length) {
				builtAttack += ` **Damage:** ${attack.damage
					.map(d => `\`${d.dice}${d.type ? ` ${d.type}` : ''}\``)
					.join(', ')}`;
			}
			attackLines.push(builtAttack);
		}
		const attackText = attackLines.join('\n');
		const title = includeTitle ? 'Attacks: ' : '';
		return attackText.length ? `${title}${attackText}` : '';
	}

	public trackerTitleText() {
		let title = '';
		if (this.sheet.info.url) {
			title += `[${this.name}](${this.sheet.info.url}) Tracker \``;
		} else {
			title += `${this.name} Tracker`;
		}
		if (this.sheet.staticInfo.level)
			title += `Level ${this.sheet.staticInfo.level ?? 'unknown'}`;
		if (this.sheet.info.heritage) title += ` ${this.sheet.info.heritage}`;
		if (this.sheet.info.ancestry) title += ` ${this.sheet.info.ancestry}`;
		if (this.sheet.info.class) title += ` ${this.sheet.info.class}`;
		return title;
	}

	public sheetTitleText() {
		let title = '';
		if (this.sheet.staticInfo.level)
			title = `Level ${this.sheet.staticInfo.level ?? 'unknown'}`;
		if (this.sheet.info.heritage) title += ` ${this.sheet.info.heritage}`;
		if (this.sheet.info.ancestry) title += ` ${this.sheet.info.ancestry}`;
		if (this.sheet.info.class) title += ` ${this.sheet.info.class}`;
		return title;
	}

	public compileTracker(mode: string): BaseMessageOptions {
		const contentGroups = [];

		if (mode === 'full_sheet') {
			//full sheet
			return { embeds: [this.compileSheetEmbed()] };
		} else {
			contentGroups.push(this.trackerTitleText());
			contentGroups.push(this.sheetBasicStatsText());
			if (mode === 'basic_stats') {
				contentGroups.push(this.sheetDefensiveStatText());
				contentGroups.push(this.sheetSaveText());
				contentGroups.push(this.sheetCastingStatText());
			}
		}
		return { content: contentGroups.join('\n'), embeds: [] };
	}

	public compileSheetEmbed(): KoboldEmbed {
		const sheetEmbed = new KoboldEmbed();

		// sheet metadata
		sheetEmbed.setTitle(this.name);
		if (this.sheet.info.url) sheetEmbed.setURL(this.sheet.info.url);
		if (this.sheet.info.imageURL) sheetEmbed.setThumbnail(this.sheet.info.imageURL);

		const descriptionGroups = [];

		// general section
		descriptionGroups.push(this.sheetBasicStatsText());
		descriptionGroups.push(this.sheetDefensiveStatText());
		descriptionGroups.push(this.sheetGameplayInfoText());

		const sheetInfoText = descriptionGroups.filter(_.identity).join('\n');

		if (sheetInfoText.length) {
			const title = this.sheetTitleText();
			sheetEmbed.addFields([
				{
					name: title ?? 'Sheet Info',
					value: sheetInfoText,
				},
			]);
		}

		// Abilities
		sheetEmbed.addFields([{ name: 'Abilities', value: this.sheetAbilitiesText(false) }]);

		// Saves
		let saveText = this.sheetSaveText(false);
		if (saveText) sheetEmbed.addFields([{ name: 'Saves', value: saveText }]);

		// Casting Stats
		let castingStatText = this.sheetCastingStatText(false);
		if (castingStatText)
			sheetEmbed.addFields([{ name: 'Spellcasting', value: castingStatText }]);

		let attackText = this.sheetAttacksText(false);
		if (attackText) sheetEmbed.addFields([{ name: 'Attacks', value: attackText }]);

		// Skills
		let skillText = this.sheetSkillText(false);
		if (skillText) {
			const skillBatches = _.chunk(skillText.split('\n'), 7);
			for (const skillGroup of skillBatches) {
				sheetEmbed.addFields([
					{ name: 'Skills', value: skillGroup.join('\n'), inline: true },
				]);
			}
		}
		return sheetEmbed;
	}

	// Gameplay Options

	public recover() {
		const updates: { name: string; initialValue: number; updatedValue: number }[] = [];
		if (Number(this.sheet.baseCounters.tempHp.current) > 0) {
			updates.push({
				name: 'Temp HP',
				initialValue: Number(this.sheet.baseCounters.tempHp.current),
				updatedValue: 0,
			});
			this._sheet.baseCounters.tempHp.current = 0;
			this.sheet.baseCounters.tempHp.current = 0;
		}
		if (Number(this.sheet.baseCounters.hp.current) < Number(this.sheet.baseCounters.hp.max)) {
			updates.push({
				name: 'HP',
				initialValue: Number(this.sheet.baseCounters.hp.current),
				updatedValue: Number(this.sheet.baseCounters.hp.max),
			});
			this._sheet.baseCounters.hp.current = Number(this.sheet.baseCounters.hp.max);
			this.sheet.baseCounters.hp.current = Number(this.sheet.baseCounters.hp.max);
		}
		if (
			this.sheet.staticInfo.usesStamina &&
			Number(this.sheet.baseCounters.stamina.current) <
				Number(this.sheet.baseCounters.stamina.max)
		) {
			updates.push({
				name: 'Stamina',
				initialValue: Number(this.sheet.baseCounters.stamina.current),
				updatedValue: Number(this.sheet.baseCounters.stamina.max),
			});
			this._sheet.baseCounters.stamina.current = Number(this.sheet.baseCounters.stamina.max);
			this.sheet.baseCounters.stamina.current = Number(this.sheet.baseCounters.stamina.max);
		}
		if (
			this.sheet.staticInfo.usesStamina &&
			Number(this.sheet.baseCounters.resolve.current) <
				Number(this.sheet.baseCounters.resolve.max)
		) {
			updates.push({
				name: 'Resolve',
				initialValue: Number(this.sheet.baseCounters.resolve.current),
				updatedValue: Number(this.sheet.baseCounters.resolve.max),
			});
			this._sheet.baseCounters.resolve.current = Number(this.sheet.baseCounters.resolve.max);
			this.sheet.baseCounters.resolve.current = Number(this.sheet.baseCounters.resolve.max);
		}
		return updates;
	}

	/**
	 *
	 * @param option One of the sheet's base counter keys, such as "hp", "stamina", "resolve", "heroPoints", "focusPoints"
	 * @param value A string representing the value to update the sheet with
	 *  			A numeric string that can start with "+" or "-" to indicate a relative change
	 * @returns An object with the initial and updated values
	 */
	public updateValue(option: SheetBaseCounterKeys, value: string) {
		const computeNewValue = (
			currentValue: number,
			update: string,
			min?: number,
			max?: number
		) => {
			let finalValue: number;
			if (update.trim().startsWith('+')) {
				finalValue = currentValue + parseInt(update.trim().substring(1));
			} else if (update.trim().startsWith('-')) {
				finalValue = currentValue - parseInt(update.trim().substring(1));
			} else {
				finalValue = parseInt(update);
			}
			if (isNaN(finalValue))
				throw new KoboldError(
					`Yip! I don\'t understand how to read "${value}" as a number!`
				);
			if (min != null && finalValue < min) finalValue = min;
			if (max != null && finalValue > max) finalValue = max;
			return finalValue;
		};
		let initialValue;
		let updatedValue;

		if (option in this.sheet.baseCounters) {
			const property = option as SheetBaseCounterKeys;
			const counter = this.sheet.baseCounters[property];
			const _counter = this._sheet.baseCounters[property];
			initialValue = counter.current;
			updatedValue = computeNewValue(initialValue, value, 0, counter.max ?? Infinity);
			counter.current = updatedValue;
			_counter.current = updatedValue;
			return { initialValue, updatedValue };
		}
		return { initialValue, updatedValue };
	}

	public matchingWeakness(damageType: string) {
		const shorthandDamageType = damageTypeShorthands[damageType];
		if (!damageType) return null;
		for (const weakness of this.sheet.weaknessesResistances.weaknesses) {
			const shorthandWeaknessType = damageTypeShorthands[weakness.type];
			if (
				weakness.type.toLowerCase() === damageType.toLowerCase() ||
				(shorthandDamageType && shorthandDamageType === weakness.type.toLowerCase()) ||
				(shorthandWeaknessType && shorthandWeaknessType === damageType.toLowerCase())
			)
				return weakness;
		}
	}

	public matchingResistance(damageType: string) {
		const shorthandDamageType = damageTypeShorthands[damageType];
		if (!damageType) return null;
		for (const resistance of this.sheet.weaknessesResistances.resistances) {
			const shorthandResistanceType = damageTypeShorthands[resistance.type];
			if (
				resistance.type.toLowerCase() === damageType.toLowerCase() ||
				(shorthandDamageType && shorthandDamageType === resistance.type.toLowerCase()) ||
				(shorthandResistanceType && shorthandResistanceType === damageType.toLowerCase())
			)
				return resistance;
		}
	}

	public matchingImmunities(damageType: string) {
		const shorthandDamageType = damageTypeShorthands[damageType];
		if (!damageType) return [];
		for (const immunity of this.sheet.infoLists.immunities) {
			const shorthandImmunityType = damageTypeShorthands[immunity];
			if (
				immunity.toLowerCase() === damageType.toLowerCase() ||
				(shorthandDamageType && shorthandDamageType === immunity.toLowerCase()) ||
				(shorthandImmunityType && shorthandImmunityType === damageType.toLowerCase())
			)
				return [immunity];
		}
	}

	public heal(amount: number) {
		const currentHp = this.sheet.baseCounters.hp.current ?? 0;
		this.sheet.baseCounters.hp.current = Math.min(
			this.sheet.baseCounters.hp.max ?? 0,
			currentHp + amount
		);
		this._sheet.baseCounters.hp.current = Math.min(
			this.sheet.baseCounters.hp.max ?? 0,
			currentHp + amount
		);
		return { totalHealed: this.sheet.baseCounters.hp.current - currentHp };
	}

	/**
	 * Takes typed damage, applies any weaknesses or resistances, alters the sheet, and returns the actual damage taken
	 */
	public applyDamage(damage: number, damageType?: string) {
		let finalDamage = damage;
		let appliedWeakness;
		let appliedResistance;
		let appliedImmunity;
		if (damageType) {
			// we import damage types that end up containing effects sentences, so split
			// up the sentences into word tokens, then check each word against our weaknesses/resistances
			const damageTypeWords = damageType.split(/\W+/);
			const weakness = _.maxBy(
				damageTypeWords
					.map(word => this.matchingWeakness(word))
					.filter(weakness => weakness != null),
				weakness => weakness?.amount ?? 0
			);
			const resistance = _.maxBy(
				damageTypeWords
					.map(word => this.matchingResistance(word))
					.filter(resistance => resistance != null),
				resistances => resistances?.amount ?? 0
			);
			const immunities = damageTypeWords
				.map(word => this.matchingImmunities(word))
				.filter(immunity => !!immunity)
				.flat();

			if (weakness?.type) {
				finalDamage = finalDamage + (weakness?.amount ?? 0);
				appliedWeakness = weakness;
			}
			if (resistance?.type) {
				finalDamage = Math.max(0, finalDamage - (resistance?.amount ?? 0));
				appliedResistance = resistance;
			}
			if (immunities.length) {
				finalDamage = 0;
				appliedImmunity = immunities[0];
			}
		}
		let initialTempHp = this.sheet.baseCounters.tempHp.current ?? 0;
		let initialStamina = this.sheet.baseCounters.stamina.current ?? 0;
		let initialHp = this.sheet.baseCounters.hp.current ?? 0;
		let unappliedDamage = finalDamage;

		// apply damage to temp hp first, then stamina, then hp
		if (initialTempHp > 0) {
			this.sheet.baseCounters.tempHp.current = Math.max(0, initialTempHp - unappliedDamage);
			this._sheet.baseCounters.tempHp.current = Math.max(0, initialTempHp - unappliedDamage);
			unappliedDamage -= Math.min(initialTempHp, unappliedDamage);
		}
		if (unappliedDamage > 0 && this.sheet.staticInfo.usesStamina && initialStamina > 0) {
			this.sheet.baseCounters.stamina.current = Math.max(0, initialStamina - unappliedDamage);
			this._sheet.baseCounters.stamina.current = Math.max(
				0,
				initialStamina - unappliedDamage
			);
			unappliedDamage -= Math.min(initialStamina, unappliedDamage);
		}
		if (unappliedDamage > 0 && initialHp > 0) {
			this.sheet.baseCounters.hp.current = Math.max(0, initialHp - unappliedDamage);
			this._sheet.baseCounters.hp.current = Math.max(0, initialHp - unappliedDamage);
			unappliedDamage -= Math.min(initialHp, unappliedDamage);
		}

		return {
			totalDamage: finalDamage,
			appliedWeakness,
			appliedResistance,
			appliedImmunity,
			appliedDamage: finalDamage - unappliedDamage,
		};
	}

	getDC(dcName: string): number | null {
		const dcPropKey = SheetProperties.standardizeProperty(dcName);

		if (['ac', 'armorclass', 'armor'].includes(dcPropKey))
			return this.sheet.intProperties.ac ?? 10;
		const stat = SheetStatProperties.aliases[dcPropKey.toLowerCase()];
		if (stat) {
			const sheetProp = SheetProperties.properties[stat];
			return this.statDcs[sheetProp.baseKey];
		}
		const additionalSkill = this.sheet.additionalSkills.find(
			s =>
				SheetProperties.standardizeCustomPropName(s.name) ===
				SheetProperties.standardizeCustomPropName(dcPropKey)
		);
		if (additionalSkill) {
			return this.interpretDc(additionalSkill);
		}
		return null;
	}

	// Roll Options

	public get bonusAttacks(): SheetAttack[] {
		const bonusAttacks: SheetAttack[] = [];

		if (!this.statIsUnset(this.sheet.stats.arcane)) {
			bonusAttacks.push({
				name: 'Arcane Spell Attack',
				toHit: this.statBonuses.arcane,
				damage: [],
				effects: [],
				range: null,
				notes: null,
				traits: ['attack', 'spell', 'arcane'],
			});
		}

		if (!this.statIsUnset(this.sheet.stats.divine)) {
			bonusAttacks.push({
				name: 'Divine Spell Attack',
				toHit: this.statBonuses.divine,
				damage: [],
				effects: [],
				range: null,
				notes: null,
				traits: ['attack', 'spell', 'divine'],
			});
		}

		if (!this.statIsUnset(this.sheet.stats.occult)) {
			bonusAttacks.push({
				name: 'Occult Spell Attack',
				toHit: this.statBonuses.occult,
				damage: [],
				effects: [],
				range: null,
				notes: null,
				traits: ['attack', 'spell', 'occult'],
			});
		}

		if (!this.statIsUnset(this.sheet.stats.primal)) {
			bonusAttacks.push({
				name: 'Primal Spell Attack',
				toHit: this.statBonuses.primal,
				damage: [],
				effects: [],
				range: null,
				notes: null,
				traits: ['attack', 'spell', 'primal'],
			});
		}

		if (!this.statIsUnset(this.sheet.stats.class)) {
			bonusAttacks.push({
				name: 'Class Attack',
				toHit: this.statBonuses.class,
				damage: [],
				effects: [],
				range: null,
				notes: null,
				traits: ['attack', 'class'],
			});
		}

		const maxWeaponMod = Math.max(
			this.sheet.intProperties.simpleProficiency ?? -99,
			this.sheet.intProperties.martialProficiency ?? -99,
			this.sheet.intProperties.unarmedProficiency ?? -99,
			this.sheet.intProperties.advancedProficiency ?? -99
		);
		if (maxWeaponMod !== -99) {
			const level = this.sheet.staticInfo.level ?? 0;
			bonusAttacks.push({
				name: '**Melee** (strength, best proficiency)',
				toHit: maxWeaponMod + level + this.abilities.strength,
				damage: [],
				effects: [],
				range: 'melee',
				notes: null,
				traits: ['attack', 'strength', 'melee'],
			});
			bonusAttacks.push({
				name: '**Ranged/Finesse** (dexterity, best proficiency)',
				toHit: maxWeaponMod + level + this.abilities.dexterity,
				damage: [],
				effects: [],
				range: 'melee',
				notes: null,
				traits: ['attack', 'dexterity', 'ranged'],
			});
		}

		return bonusAttacks;
	}

	public get attacks() {
		return _.uniqBy(this.sheet.attacks.concat(this.bonusAttacks), attack =>
			attack.name.trim().toLowerCase()
		);
	}

	public get attackRolls(): { [k: string]: attackRoll } {
		return _.keyBy(
			this.attacks
				.map(attack => ({
					name: attack.name.toLowerCase(),
					type: 'attack' as 'attack',
					toHit: attack.toHit,
					effects: attack.effects,
					damage: attack.damage ?? [],
					range: attack.range,
					traits: attack.traits ?? [],
					notes: attack.notes,
					tags: _.uniq(['attack', ...(attack.traits ?? [])]),
				}))
				.concat(),
			({ name }) => name.toLowerCase()
		);
	}

	public get abilities(): { [k in AbilityEnum]: number } {
		return {
			strength: this.sheet.intProperties.strength ?? 0,
			dexterity: this.sheet.intProperties.dexterity ?? 0,
			constitution: this.sheet.intProperties.constitution ?? 0,
			intelligence: this.sheet.intProperties.intelligence ?? 0,
			wisdom: this.sheet.intProperties.wisdom ?? 0,
			charisma: this.sheet.intProperties.charisma ?? 0,
		};
	}

	public get saves(): ProficiencyStat[] {
		const allSaveNames = SheetStatProperties.statGroups[StatGroupEnum.saves];
		return Object.values(_.pick(this.sheet.stats, allSaveNames));
	}
	public get skills(): ProficiencyStat[] {
		const allSkillNames = SheetStatProperties.statGroups[StatGroupEnum.skills];
		return Object.values(_.pick(this.sheet.stats, allSkillNames)).concat(
			this.sheet.additionalSkills
		);
	}
	public get castingStats(): ProficiencyStat[] {
		const allCastingStatNames = SheetStatProperties.statGroups[StatGroupEnum.casting];
		return Object.values(_.pick(this.sheet.stats, allCastingStatNames));
	}
	public get checks(): ProficiencyStat[] {
		const allCheckNames = SheetStatProperties.statGroups[StatGroupEnum.checks].concat(
			SheetStatProperties.statGroups[StatGroupEnum.class]
		);
		return Object.values(_.pick(this.sheet.stats, allCheckNames));
	}

	public get ac(): number {
		return this.sheet.intProperties.ac ?? 10;
	}
	public get abilityList(): { name: string; value: number | null }[] {
		const allAbilityNames = SheetIntegerProperties.statGroups[SheetIntegerGroupEnum.abilities];
		return Object.entries(_.pick(this.sheet.intProperties, allAbilityNames)).map(
			([intPropName, intPropValue]) => ({
				name: intPropName,
				value: intPropValue,
			})
		);
	}
	public get speeds(): { name: string; value: number | null }[] {
		const allSpeedNames = SheetIntegerProperties.statGroups[SheetIntegerGroupEnum.speeds];
		return Object.entries(_.pick(this.sheet.intProperties, allSpeedNames)).map(
			([intPropName, intPropValue]) => ({
				name: intPropName.replace('Speed', ''),
				value: intPropValue,
			})
		);
	}
	public get armorProficiencies(): { name: string; value: number | null }[] {
		const allArmorProfNames =
			SheetIntegerProperties.statGroups[SheetIntegerGroupEnum.armorProficiencies];
		return Object.entries(_.pick(this.sheet.intProperties, allArmorProfNames)).map(
			([intPropName, intPropValue]) => ({
				name: intPropName.replace('Proficiency', ''),
				value: intPropValue,
			})
		);
	}
	public get weaponProficiencies(): { name: string; value: number | null }[] {
		const allWeaponProfNames =
			SheetIntegerProperties.statGroups[SheetIntegerGroupEnum.weaponProficiencies];
		return Object.entries(_.pick(this.sheet.intProperties, allWeaponProfNames)).map(
			([intPropName, intPropValue]) => ({
				name: intPropName.replace('Proficiency', ''),
				value: intPropValue,
			})
		);
	}

	public get counters(): Counter[] {
		return Object.values(this.sheet.baseCounters);
	}

	public get keyedActions() {
		return _.keyBy(this.actions, action => action.name);
	}

	public get statBonuses(): { [k in SheetStatKeys]: number } {
		return _.mapValues(this.sheet.stats, stat => this.interpretBonus(stat));
	}

	public get statDcs(): { [k in SheetStatKeys]: number } {
		return _.mapValues(this.sheet.stats, stat => this.interpretDc(stat));
	}

	public statToRoll(stat: ProficiencyStat, statType: string): roll {
		const name = SheetProperties.standardizeCustomPropName(stat.name);
		return {
			name: name,
			type: statType,
			bonus: this.interpretBonus(stat),
			tags: [statType, name, stat.ability ?? ''].filter(_.identity),
		};
	}
	public statsToRolls(
		stats: ProficiencyStat[],
		statType: string
	): {
		[rollName: string]: roll;
	} {
		return _.keyBy(
			stats.map(stat => this.statToRoll(stat, statType)),
			stat => SheetProperties.standardizeCustomPropName(stat.name)
		);
	}

	public get savingThrowRolls(): {
		[rollName: string]: roll;
	} {
		return this.statsToRolls(this.saves, 'save');
	}
	public get skillRolls(): {
		[rollName: string]: roll;
	} {
		const rolls: {
			[rollName: string]: roll;
		} = {};

		return this.statsToRolls(this.skills, 'skill');
	}

	public get rolls(): {
		[rollName: string]: roll;
	} {
		return {
			...this.statsToRolls([this.sheet.stats.perception], 'check'),
			...this.savingThrowRolls,
			...this.skillRolls,
		};
	}

	public getRollNames() {
		return _.keys(this.rolls);
	}

	public get attributes() {
		return AttributeUtils.getAttributes(this);
	}

	public static preserveSheetTrackerValues(sheet: Sheet, updateFrom?: Sheet): Sheet {
		if (updateFrom) {
			let baseCounterKey: SheetBaseCounterKeys;
			for (baseCounterKey in sheet.baseCounters) {
				sheet.baseCounters[baseCounterKey].current =
					updateFrom.baseCounters[baseCounterKey].current ??
					sheet.baseCounters[baseCounterKey].current;
			}
		}
		return sheet;
	}

	public static fromSheetRecord(sheetRecord: SheetRecord): Creature {
		let sheet = { ...sheetRecord.sheet };
		return new Creature(sheetRecord.sheet, {
			actions: sheetRecord.actions ?? [],
			modifiers: sheetRecord.modifiers ?? [],
			rollMacros: sheetRecord.rollMacros ?? [],
		});
	}

	public static fromWandererersGuide(
		calculatedStats: WG.CharacterCalculatedStatsApiResponse,
		characterData: WG.CharacterApiResponse,
		updateFrom?: SheetRecord
	): Creature {
		let sheet = convertWanderersGuideCharToSheet(calculatedStats, characterData);
		sheet = Creature.preserveSheetTrackerValues(sheet, updateFrom?.sheet);
		return new Creature(sheet, {
			actions: updateFrom?.actions ?? [],
			modifiers: updateFrom?.modifiers ?? [],
			rollMacros: updateFrom?.rollMacros ?? [],
		});
	}

	public static fromPathBuilder(
		pathBuilderSheet: PathBuilder.Character,
		updateFrom?: SheetRecord,
		options: {
			useStamina: boolean;
		} = { useStamina: false }
	): Creature {
		let sheet = convertPathBuilderToSheet(pathBuilderSheet, options);
		if (updateFrom) {
			sheet.info.imageURL = updateFrom.sheet.info.imageURL ?? sheet.info.imageURL;
		}
		sheet = Creature.preserveSheetTrackerValues(sheet, updateFrom?.sheet);
		return new Creature(sheet, {
			actions: updateFrom?.actions ?? [],
			modifiers: updateFrom?.modifiers ?? [],
			rollMacros: updateFrom?.rollMacros ?? [],
		});
	}

	//roll helpers

	/**
	 * Gets a list of the applicable modifiers for any set of tags
	 * @param tags the tags to check against a character's modifiers
	 * @returns modifier[]
	 */
	public getModifiersFromTags(tags: string[], extraAttributes?: Attribute[]): Modifier[] {
		const { untyped, bonuses, penalties } = ModifierUtils.parseBonusesForTagsFromModifiers(
			this.modifiers.filter(modifier => modifier.modifierType === 'roll'),
			[...(this.attributes as Attribute[]), ...(extraAttributes || [])],
			tags,
			this
		);
		return untyped.concat(_.flatten(_.values(bonuses)), _.flatten(_.values(penalties)));
	}

	/**
	 * Uses a creature's roll macros to expand a roll
	 */
	public expandRollWithMacros(rollExpression: string): string {
		const creatureRollMacros = this.rollMacros || [];
		const maxDepth = 10;
		let resultRollExpression = rollExpression.toLocaleLowerCase();
		for (let i = 0; i < maxDepth; i++) {
			let rollExpressionBeforeExpanding = resultRollExpression;
			// replace every instance of each macro in the rollExpression with the macro's value
			for (const macro of creatureRollMacros) {
				resultRollExpression = resultRollExpression.replaceAll(
					`[${macro.name.toLocaleLowerCase()}]`,
					macro.macro
				);
			}
			// if we haven't changed the roll expression, then we're done checking macros
			if (rollExpressionBeforeExpanding === resultRollExpression) break;
		}
		return resultRollExpression;
	}
}
